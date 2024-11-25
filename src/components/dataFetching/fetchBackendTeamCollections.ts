
export async function fetchBackendTeamsCollection() {
    try {
        const response = await fetch('http://localhost:4000/getCollections', {
            mode: 'cors', 
            method: 'GET',
        })
        const data = await response.json();
        return data
    } catch (error) {
        console.error('Failed to fetch:', error);
        return []
    }
}