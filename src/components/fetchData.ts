import * as path from 'path'
import Papa from 'papaparse'

export interface bc_game {
    id: number;
    team_home: string;
    team_away: string;
    starts_at: string;
    tournament_name: string;
  }

export interface bc_streaming_offer {
    game_id: number
    streaming_package_id: number
    livehighlights: string
}

export interface bc_streaming_package {
    id?: number
    streaming_package_id? : number
    name: string
    monthly_price_cents: number
    monthly_price_yearly_subscription_in_cents: number
}

  const bc_gameHeaders = ['id', 'team_home', 'team_away', 'starts_at', 'tournament_name'];
  const bc_streaming_offerHeaders = ['game_id', 'streaming_package_id', 'live,highlights'];
  const bc_streaming_packageHeaders = ['id', 'name', 'monthly_price_cents', 'monthly_price_yearly_subscription_in_cents'];
  
  const bc_gamePath = '/data/bc_game.csv';
  const bc_streaming_offerPath = '/data/bc_streaming_offer.csv';
  const bc_streaming_packagePath = '/data/bc_streaming_package.csv';

export async function fetchData(filename: string) {

    if (filename == 'bc_game') {
        const fetchCSV = async () => {
            const response = await fetch(bc_gamePath)
            const csvText = await response.text()
            return new Promise((resolve, reject) => {
                Papa.parse(csvText, {
                    header: true,
                    dynamicTyping: true,
                    complete: (results) => {
                        if (results.data) {
                            resolve(results.data as bc_game[])
                        } else {
                            reject(new Error("Parsed data is undefined"))
                        }
                    },
                    error: (error: Error) => {
                        reject(error)
                    }
                })
            })

        }

        try {
            return await fetchCSV()
        } catch (error) {
            console.error(error)
            throw error
        }


    } else if (filename == 'bc_streaming_offer') {
        const fetchCSV = async () => {
            const response = await fetch(bc_streaming_offerPath)
            const csvText = await response.text()
            return new Promise((resolve, reject) => {
                Papa.parse(csvText, {
                    header: true,
                    dynamicTyping: true,
                    complete: (results) => {
                        resolve(results.data as bc_streaming_offer[])
                    },
                    error: (error: Error) => {
                        reject(error)
                    }
                })
            })

        }

        try {
            return await fetchCSV()
        } catch (error) {
            console.error(error)
            throw error
        }

    } else if (filename == 'bc_streaming_package') {
        const fetchCSV = async () => {
            const response = await fetch(bc_streaming_packagePath)
            const csvText = await response.text()
            return new Promise((resolve, reject) => {
                Papa.parse(csvText, {
                    header: true,
                    dynamicTyping: true,
                    complete: (results) => {
                        if (results.data) {
                            resolve(results.data as bc_streaming_package[])
                        } else {
                            reject(new Error("Parsed data is undefined"))
                        }
                    },
                    error: (error: Error) => {
                        reject(error)
                    }
                })
            })

        }

        try {
            return await fetchCSV()
        } catch (error) {
            console.error(error)
            throw error
        }
    } else {
        throw new Error('Invalid filename')
    }
}
    