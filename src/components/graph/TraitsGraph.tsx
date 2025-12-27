"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Trait, NodeType, LegacyCategory, EvidenceLevel, useTraitsStore, migrateCategory } from "@/stores/useTraitsStore";


interface TraitsGraphProps {
    traits: Trait[];
}

interface GraphNode extends d3.SimulationNodeDatum {
    id: string;
    label: string;
    type: NodeType | LegacyCategory;
    importance: number;
    evidenceLevel: EvidenceLevel;
}

// Evidence level icons (Lucide icon paths at 24x24 viewBox)
const evidenceIcons: Record<EvidenceLevel, { path: string; color: string; label: string }> = {
    theory: {
        // BookOpen icon
        path: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z",
        color: "#94a3b8", // slate-400
        label: "Теория",
    },
    practice: {
        // Wrench icon
        path: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z",
        color: "#3b82f6", // blue-500
        label: "Практика",
    },
    result: {
        // Trophy icon
        path: "M6 9H4.5a2.5 2.5 0 0 1 0-5H6 M18 9h1.5a2.5 2.5 0 0 0 0-5H18 M4 22h16 M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22 M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22 M18 2H6v7a6 6 0 0 0 12 0V2Z",
        color: "#22c55e", // green-500
        label: "Результат",
    },
};

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
    source: string | GraphNode;
    target: string | GraphNode;
    type: string;
}

// STAR-Graph color palette organized by layers
const nodeColors: Record<NodeType, string> = {
    // Layer 1: Assets (синие оттенки)
    ROLE: "#3b82f6",      // blue-500
    DOMAIN: "#6366f1",    // indigo-500
    SKILL: "#0ea5e9",     // sky-500
    // Layer 2: Actions (оранжевые оттенки)
    CHALLENGE: "#f97316", // orange-500
    ACTION: "#fb923c",    // orange-400
    // Layer 3: Impact (зелёные оттенки)
    METRIC: "#22c55e",    // green-500
    ARTIFACT: "#10b981",  // emerald-500
    // Layer 4: Attributes (фиолетовые оттенки)
    ATTRIBUTE: "#a855f7", // purple-500
};

// Legacy colors for backward compatibility
const legacyColors: Record<LegacyCategory, string> = {
    skills: "#0ea5e9",    // maps to SKILL
    context: "#6366f1",   // maps to DOMAIN
    artifacts: "#10b981", // maps to ARTIFACT
    attributes: "#a855f7", // maps to ATTRIBUTE
};

const DEFAULT_COLOR = "#6b7280"; // gray-500 fallback

function getNodeColor(type: NodeType | LegacyCategory): string {
    // Try new NodeType colors first
    if (type in nodeColors) {
        return nodeColors[type as NodeType];
    }
    // Fallback to legacy colors
    if (type in legacyColors) {
        return legacyColors[type as LegacyCategory];
    }
    return DEFAULT_COLOR;
}

export function TraitsGraph({ traits }: TraitsGraphProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

    const externalHighlightIds = useTraitsStore(state => state.externalHighlightIds);
    const externalHighlightMode = useTraitsStore(state => state.externalHighlightMode);

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
            type: trait.type,
            importance: trait.importance,
            evidenceLevel: trait.evidenceLevel || "theory",
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
            .attr("fill", d => getNodeColor(d.type))
            .attr("fill-opacity", 0.8)
            .attr("stroke", d => getNodeColor(d.type))
            .attr("stroke-width", 2)
            .attr("stroke-opacity", 0.5)
            .style("filter", "url(#glow)");

        // Draw delete icon (centered, hidden by default)
        node.append("path")
            .attr("d", "M18 6 6 18 M6 6 18 18") // X icon path
            .attr("transform", d => `translate(-13.5, -13.5) scale(1.125)`) // Center and scale 1.5x bigger again (was 0.75 -> 1.125)
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-width", 2)
            .attr("stroke-linecap", "round")
            .attr("stroke-linejoin", "round")
            .attr("class", "delete-icon")
            .attr("opacity", 0)
            .style("pointer-events", "none");

        // Draw evidence level icon (centered, scaled relative to node size)
        node.append("path")
            .attr("d", d => evidenceIcons[d.evidenceLevel].path)
            .attr("transform", d => {
                const radius = getNodeRadius(d.importance);
                // Scale icon proportionally to node radius (base icon is 24x24)
                // Smaller icons: divide by larger number
                const scale = radius / 24;
                const offset = 12 * scale; // Center the icon
                return `translate(-${offset}, -${offset}) scale(${scale})`;
            })
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-width", d => {
                const radius = getNodeRadius(d.importance);
                // Thinner stroke for smaller nodes
                return radius < 12 ? 2.5 : 2;
            })
            .attr("stroke-linecap", "round")
            .attr("stroke-linejoin", "round")
            .attr("class", "evidence-icon")
            .style("pointer-events", "none");




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
        node.on("mouseenter", function (event, d) {
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

            // Hide evidence icons on non-connected nodes
            node.select(".evidence-icon")
                .attr("opacity", n => connectedIds.has(n.id) ? 1 : 0);

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

        node.on("mouseleave", function () {
            // Reset all
            node.select("circle")
                .attr("fill-opacity", 0.8)
                .attr("stroke-opacity", 0.5);

            node.select("text")
                .attr("fill-opacity", 0.9);

            // Reset evidence icons
            node.select(".evidence-icon")
                .attr("opacity", 1);

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

    // Handle external highlighting without restarting simulation
    useEffect(() => {
        if (!svgRef.current) return;
        const svg = d3.select(svgRef.current);
        const node = svg.selectAll(".nodes g");
        const link = svg.selectAll(".links line");

        if (node.empty()) return;

        // Determine connected nodes
        const highlightIds = new Set(externalHighlightIds || []);
        const connectedIds = new Set<string>();

        if (highlightIds.size > 0) {
            // Add self
            highlightIds.forEach(id => connectedIds.add(id));

            // Add neighbors
            link.each((d: any) => {
                const sourceId = typeof d.source === "object" ? d.source.id : d.source;
                const targetId = typeof d.target === "object" ? d.target.id : d.target;

                if (highlightIds.has(sourceId)) connectedIds.add(targetId);
                if (highlightIds.has(targetId)) connectedIds.add(sourceId);
            });
        }

        const isDeleteMode = externalHighlightMode === 'delete';

        // Apply highlighting logic
        node.select("circle")
            .attr("fill", (d: any) => {
                if (highlightIds.has(d.id)) {
                    if (isDeleteMode) return "#ef4444"; // Red for delete
                    return getNodeColor(d.type); // Type color for normal highlight
                }
                return getNodeColor(d.type);
            })
            .attr("fill-opacity", (d: any) => {
                if (highlightIds.size > 0) {
                    return connectedIds.has(d.id) ? 1 : 0.1;
                }
                return 0.8;
            })
            .attr("stroke", (d: any) => {
                if (highlightIds.has(d.id)) {
                    if (isDeleteMode) return "#b91c1c"; // Dark red for delete
                    return getNodeColor(d.type);
                }
                return getNodeColor(d.type);
            })
            .attr("stroke-width", (d: any) => highlightIds.has(d.id) ? 3 : 2)
            .attr("stroke-opacity", (d: any) => {
                if (highlightIds.size > 0) {
                    return connectedIds.has(d.id) ? 1 : 0.1;
                }
                return 0.5;
            });

        // Toggle delete icon visibility
        node.select(".delete-icon")
            .attr("opacity", (d: any) => (highlightIds.has(d.id) && isDeleteMode) ? 1 : 0);

        // Toggle evidence icon visibility (hide when delete icon is shown)
        node.select(".evidence-icon")
            .attr("opacity", (d: any) => (highlightIds.has(d.id) && isDeleteMode) ? 0 : 1);

        // Hide text if trash icon is visible to avoid clutter? Or keep it?
        // Let's hide text only for the deleted node when in delete mode for cleaner look.
        node.select("text")
            .attr("fill-opacity", (d: any) => {
                if (highlightIds.has(d.id) && isDeleteMode) return 0; // Hide text when trash is shown
                if (highlightIds.size > 0) {
                    return connectedIds.has(d.id) ? 0.9 : 0.1;
                }
                return 0.9;
            });

        // Dim links not connected to HIGHlighted nodes
        link.attr("stroke-opacity", (d: any) => {
            if (highlightIds.size > 0) {
                const sourceId = typeof d.source === "object" ? d.source.id : d.source;
                const targetId = typeof d.target === "object" ? d.target.id : d.target;

                // Highlight links directly connected to the BADGE items
                if (highlightIds.has(sourceId) || highlightIds.has(targetId)) {
                    return 0.6;
                }
                return 0.05;
            }
            return 0.2;
        });

    }, [externalHighlightIds, externalHighlightMode]);



    // Calculate node radius based on importance (1-5 -> 8-24px)
    function getNodeRadius(importance: number): number {
        return 8 + (importance - 1) * 4;
    }

    if (traits.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center px-8 h-full text-center">
                <div className="flex justify-center items-center bg-muted mb-4 rounded-2xl w-20 h-20">
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
                <h3 className="mb-2 font-semibold text-foreground text-lg">
                    Нет элементов для отображения
                </h3>
                <p className="max-w-md text-muted-foreground text-sm">
                    Добавьте навыки и достижения через чат или выберите другую категорию.
                </p>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="relative w-full h-full min-h-[400px]">
            <svg
                ref={svgRef}
                width={dimensions.width}
                height={dimensions.height}
                className="w-full h-full"
                style={{ background: "transparent" }}
            />


        </div>
    );
}
