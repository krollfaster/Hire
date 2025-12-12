"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Trait, TraitCategory } from "@/stores/useTraitsStore";

interface TraitsGraphProps {
    traits: Trait[];
}

interface GraphNode extends d3.SimulationNodeDatum {
    id: string;
    label: string;
    category: TraitCategory;
    importance: number;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
    source: string | GraphNode;
    target: string | GraphNode;
    type: string;
}

const categoryColors: Record<TraitCategory, string> = {
    hard_skills: "#3b82f6", // blue-500
    impact: "#22c55e",      // green-500
    domain: "#a855f7",      // purple-500
    superpower: "#f59e0b",  // amber-500
};

export function TraitsGraph({ traits }: TraitsGraphProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

    // Update dimensions on resize
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setDimensions({ width, height });
            }
        };

        updateDimensions();
        window.addEventListener("resize", updateDimensions);
        return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    useEffect(() => {
        if (!svgRef.current || traits.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const { width, height } = dimensions;

        // Create nodes from traits
        const nodes: GraphNode[] = traits.map(trait => ({
            id: trait.id,
            label: trait.label,
            category: trait.category,
            importance: trait.importance,
        }));

        // Create links from relations
        const links: GraphLink[] = [];
        const nodeIds = new Set(nodes.map(n => n.id));
        
        traits.forEach(trait => {
            trait.relations?.forEach(relation => {
                if (nodeIds.has(relation.targetId)) {
                    links.push({
                        source: trait.id,
                        target: relation.targetId,
                        type: relation.type,
                    });
                }
            });
        });

        // Create zoom behavior
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.2, 4])
            .on("zoom", (event) => {
                container.attr("transform", event.transform);
            });

        svg.call(zoom);

        // Create container for zoom/pan
        const container = svg.append("g");

        // Create force simulation
        const simulation = d3.forceSimulation<GraphNode>(nodes)
            .force("link", d3.forceLink<GraphNode, GraphLink>(links)
                .id(d => d.id)
                .distance(100)
                .strength(0.5))
            .force("charge", d3.forceManyBody()
                .strength(-300)
                .distanceMax(400))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collision", d3.forceCollide<GraphNode>()
                .radius(d => getNodeRadius(d.importance) + 20))
            .force("x", d3.forceX(width / 2).strength(0.05))
            .force("y", d3.forceY(height / 2).strength(0.05));

        // Create gradient definitions for links
        const defs = svg.append("defs");
        
        // Create glow filter
        const filter = defs.append("filter")
            .attr("id", "glow")
            .attr("x", "-50%")
            .attr("y", "-50%")
            .attr("width", "200%")
            .attr("height", "200%");
        
        filter.append("feGaussianBlur")
            .attr("stdDeviation", "3")
            .attr("result", "coloredBlur");
        
        const feMerge = filter.append("feMerge");
        feMerge.append("feMergeNode").attr("in", "coloredBlur");
        feMerge.append("feMergeNode").attr("in", "SourceGraphic");

        // Draw links
        const link = container.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(links)
            .enter()
            .append("line")
            .attr("stroke", "currentColor")
            .attr("stroke-opacity", 0.2)
            .attr("stroke-width", 1);

        // Create node groups
        const node = container.append("g")
            .attr("class", "nodes")
            .selectAll("g")
            .data(nodes)
            .enter()
            .append("g")
            .attr("cursor", "grab")
            .call(d3.drag<SVGGElement, GraphNode>()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        // Draw node circles
        node.append("circle")
            .attr("r", d => getNodeRadius(d.importance))
            .attr("fill", d => categoryColors[d.category])
            .attr("fill-opacity", 0.8)
            .attr("stroke", d => categoryColors[d.category])
            .attr("stroke-width", 2)
            .attr("stroke-opacity", 0.5)
            .style("filter", "url(#glow)");

        // Draw node labels
        node.append("text")
            .text(d => d.label)
            .attr("x", d => getNodeRadius(d.importance) + 8)
            .attr("y", 4)
            .attr("font-size", "12px")
            .attr("fill", "currentColor")
            .attr("fill-opacity", 0.9)
            .style("pointer-events", "none")
            .style("user-select", "none");

        // Highlight on hover
        node.on("mouseenter", function(event, d) {
            // Highlight connected nodes
            const connectedIds = new Set<string>();
            connectedIds.add(d.id);
            
            links.forEach(l => {
                const sourceId = typeof l.source === "object" ? l.source.id : l.source;
                const targetId = typeof l.target === "object" ? l.target.id : l.target;
                if (sourceId === d.id) connectedIds.add(targetId);
                if (targetId === d.id) connectedIds.add(sourceId);
            });

            // Dim non-connected nodes
            node.select("circle")
                .attr("fill-opacity", n => connectedIds.has(n.id) ? 1 : 0.2)
                .attr("stroke-opacity", n => connectedIds.has(n.id) ? 1 : 0.1);
            
            node.select("text")
                .attr("fill-opacity", n => connectedIds.has(n.id) ? 1 : 0.2);

            // Highlight connected links
            link.attr("stroke-opacity", l => {
                const sourceId = typeof l.source === "object" ? l.source.id : l.source;
                const targetId = typeof l.target === "object" ? l.target.id : l.target;
                return (sourceId === d.id || targetId === d.id) ? 0.6 : 0.05;
            }).attr("stroke-width", l => {
                const sourceId = typeof l.source === "object" ? l.source.id : l.source;
                const targetId = typeof l.target === "object" ? l.target.id : l.target;
                return (sourceId === d.id || targetId === d.id) ? 2 : 1;
            });
        });

        node.on("mouseleave", function() {
            // Reset all
            node.select("circle")
                .attr("fill-opacity", 0.8)
                .attr("stroke-opacity", 0.5);
            
            node.select("text")
                .attr("fill-opacity", 0.9);

            link.attr("stroke-opacity", 0.2)
                .attr("stroke-width", 1);
        });

        // Update positions on tick
        simulation.on("tick", () => {
            link
                .attr("x1", d => (d.source as GraphNode).x!)
                .attr("y1", d => (d.source as GraphNode).y!)
                .attr("x2", d => (d.target as GraphNode).x!)
                .attr("y2", d => (d.target as GraphNode).y!);

            node.attr("transform", d => `translate(${d.x},${d.y})`);
        });

        // Drag functions
        function dragstarted(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
            d3.select(event.sourceEvent.target.parentNode).attr("cursor", "grabbing");
        }

        function dragged(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
            d3.select(event.sourceEvent.target.parentNode).attr("cursor", "grab");
        }

        // Initial zoom to fit
        const initialScale = 0.9;
        svg.call(zoom.transform, d3.zoomIdentity
            .translate(width * (1 - initialScale) / 2, height * (1 - initialScale) / 2)
            .scale(initialScale));

        return () => {
            simulation.stop();
        };
    }, [traits, dimensions]);

    // Calculate node radius based on importance (1-5 -> 8-24px)
    function getNodeRadius(importance: number): number {
        return 8 + (importance - 1) * 4;
    }

    if (traits.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
                <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <svg
                        className="w-10 h-10 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                        />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                    Нет элементов для отображения
                </h3>
                <p className="text-muted-foreground text-sm max-w-md">
                    Добавьте навыки и достижения через чат или выберите другую категорию.
                </p>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="w-full h-full min-h-[400px] relative">
            <svg
                ref={svgRef}
                width={dimensions.width}
                height={dimensions.height}
                className="w-full h-full"
                style={{ background: "transparent" }}
            />
            
            {/* Legend */}
            <div className="absolute bottom-4 left-4 flex flex-wrap gap-3 text-xs">
                {Object.entries(categoryColors).map(([category, color]) => (
                    <div key={category} className="flex items-center gap-1.5">
                        <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: color }}
                        />
                        <span className="text-muted-foreground">
                            {category === "hard_skills" && "Навыки"}
                            {category === "impact" && "Результаты"}
                            {category === "domain" && "Сферы"}
                            {category === "superpower" && "Суперсила"}
                        </span>
                    </div>
                ))}
            </div>

            {/* Controls hint */}
            <div className="absolute bottom-4 right-4 text-xs text-muted-foreground">
                Колёсико — масштаб • Перетаскивание — перемещение
            </div>
        </div>
    );
}
