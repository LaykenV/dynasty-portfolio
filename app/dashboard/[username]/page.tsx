import PortfolioTable from '../../../components/PortfolioTable';

const Dashboard = async ({ params }: { params: { username: string } }) => {
    const { username } = params;
  
    // Step 1: Fetch initial Sleeper user data
    const sleeperUserResponse = await fetch(`https://api.sleeper.app/v1/user/${username}`);
    if (!sleeperUserResponse.ok) {
      throw new Error('Failed to fetch Sleeper user data');
    }
    const sleeperUserData = await sleeperUserResponse.json();
  
    // Step 2: Fetch additional data in parallel using Promise.all
    const [sleeperLeagueResponse, serveUDResponse, serveKTCResponse] = await Promise.all([
      fetch(`https://api.sleeper.app/v1/user/${sleeperUserData.user_id}/leagues/nfl/2024`),
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/serveUD`),
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/serveKTC`)
    ]);
  
    // Step 3: Check if all fetches were successful
    const responses = [sleeperLeagueResponse, serveUDResponse, serveKTCResponse];
    const allSuccessful = responses.every(response => response.ok);
    
    if (!allSuccessful) {
      throw new Error('error fetching data');
    }
  
    // Step 4: Parse the responses
    const [sleeperLeagueData, serveUDData, serveKTCData] = await Promise.all(
      responses.map(response => response.json())
    );

    console.log('sleeper user data', sleeperUserData);
    console.log('sleeper league data', sleeperLeagueData);
    console.log('UD rankings', serveUDData);
    console.log('KTC rankings', serveKTCData);
    
    
    
  
    return (
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <h1>User Dashboard: {username}</h1>
        <PortfolioTable sleeperData={sleeperLeagueData}></PortfolioTable>
      </main>
    );
  };
  
  export default Dashboard;