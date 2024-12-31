import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Skeleton } from '@mui/material';
import { formatPrice } from '../utils/formatPrice';
import { Game } from './fetchSolverResult';

interface PackageCardProps {
  packageName: string
  packagePrice: number
  loading: boolean
  solverResultGames: Game[]
  onExpandChange?: (isExpanded: boolean) => void;
}

export default function PackageCard({ packageName, packagePrice, loading }: PackageCardProps): JSX.Element {
  return (
    <Card sx={{ width: 300 }}>
      {loading ? (
        <Skeleton sx={{ height: 194 }} animation="wave" variant="rectangular" />
      ) : (
        <CardMedia
        component="img"
        height="194"
        image={`/images/packageLogos/${packageName}.png`}
        alt="Logo"
        />
      )}
      <CardContent>
        <Typography variant="h5" sx={{ color: 'text.secondary', flexGrow: 1, height: '5.5em' }}>
        {loading ? (
            <Skeleton />
        ) : (
          packageName
        )}
        </Typography>
        <Typography variant="h5" sx={{ marginTop: 'auto' }}>
        {loading ? (
          <Skeleton />
        ) : (
          formatPrice(packagePrice)
        )}
        </Typography>
      </CardContent>
    </Card>
  );
}