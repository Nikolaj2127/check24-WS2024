
import _ from "lodash";
import { Game } from "./fetchSolverResult";

export const group = (array: any) => {
      const gameMap = new Map();
      array.forEach((game: Game) => {
        if (!gameMap.has(game.game_id)) {
          gameMap.set(game.game_id, {
            ...game,
            packages: [
              { name: game.name, live: game.live, highlights: game.highlights },
            ],
          });
        } else {
          gameMap
            .get(game.game_id)
            .packages.push({
              name: game.name,
              live: game.live,
              highlights: game.highlights,
            });
        }
      });
      let uniqueGames = Array.from(gameMap.values());
      uniqueGames = uniqueGames.map(
        ({
          name,
          streaming_package_id,
          id,
          monthly_price_cents,
          monthly_price_yearly_subscription_in_cents,
          live,
          highlights,
          ...rest
        }) => rest
      );
      const grouped = _.groupBy(
        uniqueGames,
        (game: any) => game.tournament_name
      );
      return grouped;
    };