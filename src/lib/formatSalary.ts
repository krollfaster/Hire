/**
 * Форматирует диапазон зарплаты в читаемый вид.
 * Например: 150000-250000 → "150к - 250к"
 */
export function formatSalary(min: number | null, max: number | null): string {
    const formatK = (n: number): string => {
        if (n >= 1000) {
            return `${Math.round(n / 1000)}к`;
        }
        return n.toString();
    };

    if (min && max) {
        return `${formatK(min)} - ${formatK(max)}`;
    }
    if (min) {
        return `от ${formatK(min)}`;
    }
    if (max) {
        return `до ${formatK(max)}`;
    }
    return "";
}
