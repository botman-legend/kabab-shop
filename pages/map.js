import { useSession } from "next-auth/react";
import dynamic from 'next/dynamic';

const DynamicMapComponent = dynamic(() => import('../components/MapComponent'), { ssr: false });

const MapPage = () => {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="bg-black w-screen h-screen flex items-center">
        <div className="text-center w-full">
          <h1>Please sign in to view the map</h1>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>Map Page</h1>
      <DynamicMapComponent session={session} /> {/* Pass session as a prop */}
    </div>
  );
};

export default MapPage;
