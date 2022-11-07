/**
 * Corrects the title of the stat.
 * @param prop the key of the prop
 * @returns the text label for that key
 */
export const statTitle = (prop: string): string => {
    const props: Record<string, string> = {
        games: 'Games Played',
        winrate: 'Winrate',
        kda: 'KDA',
        kills: 'Kills',
        deaths: 'Deaths',
        assists: 'Assists',
        cs: 'Farm total',
        csmin: 'CS / Min',
        gold: 'Gold',
        max_kills: 'Max Kills',
        max_deaths: 'Max Deaths',
        avg_damage_dealt: 'Avg Damage',
        avg_damage_taken: 'Avg Tank',
        double_kills: 'Double Kills',
        triple_kills: 'Triple Kills',
        quadra_kills: 'Quadra Kills',
        penta_kills: '🔥 Pentakills 🔥',
    }

    return props[prop] ?? prop
}
