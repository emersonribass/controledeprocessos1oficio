
import LoginForm from "@/components/Auth/LoginForm";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth";

const LoginPage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Evitar redirecionamentos múltiplos
    if (hasRedirected) return;
    
    if (!isLoading && user) {
      console.log("LoginPage: Usuário já autenticado, redirecionando para /dashboard");
      setHasRedirected(true);
      navigate("/dashboard", { replace: true });
    }
  }, [user, isLoading, navigate, hasRedirected]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30">
      <div className="mb-8 text-center">
        <svg 
          className="h-28 w-28 mx-auto mb-2"
          xmlns="http://www.w3.org/2000/svg" 
          width="28.7866mm" 
          height="29.6332mm" 
          version="1.1" 
          viewBox="0 0 2878.66 2963.32">
          <path 
            fill="#54361B" 
            fillRule="nonzero"
            d="M160.58 2276.54c0,-22.04 -4.65,-39.79 -13.96,-53.25 -9.3,-13.47 -26.69,-20.2 -52.15,-20.2l-7.34 0 0 -14.69 47.74 0c23.99,0 43.7,3.91 59.13,11.75 15.42,7.83 28.77,18.61 40.03,32.32l257.08 319.51 0 -363.58 29.38 0 0 492.13 -14.69 0 -315.84 -392.97 0 385.62 -29.38 0 0 -396.64z"/>
          <path 
            fill="#54361B" 
            fillRule="nonzero"
            d="M998.68 2430.79c0,-34.77 -3.55,-66.23 -10.65,-94.39 -7.1,-28.15 -17.26,-52.15 -30.48,-71.98 -13.23,-19.83 -29.39,-35.01 -48.48,-45.54 -19.1,-10.53 -40.65,-15.79 -64.64,-15.79 -24,0 -45.54,5.26 -64.64,15.79 -19.1,10.53 -35.26,25.71 -48.48,45.54 -13.22,19.83 -23.38,43.83 -30.48,71.98 -7.11,28.16 -10.66,59.62 -10.66,94.39 0,34.77 3.55,66.23 10.66,94.38 7.1,28.16 17.26,52.16 30.48,71.99 13.22,19.83 29.38,35.01 48.48,45.54 19.1,10.53 40.64,15.79 64.64,15.79 23.99,0 45.54,-5.26 64.64,-15.79 19.09,-10.53 35.25,-25.71 48.48,-45.54 13.22,-19.83 23.38,-43.83 30.48,-71.99 7.1,-28.15 10.65,-59.61 10.65,-94.38zm-381.96 0c0,-35.75 5.26,-69.29 15.79,-100.63 10.53,-31.34 25.71,-58.64 45.54,-81.9 19.83,-23.26 43.84,-41.5 71.99,-54.72 28.16,-13.22 59.62,-19.83 94.39,-19.83 34.77,0 66.23,6.61 94.38,19.83 28.16,13.22 52.16,31.46 71.99,54.72 19.83,23.26 35.01,50.56 45.54,81.9 10.53,31.34 15.79,64.88 15.79,100.63 0,36.23 -5.26,69.9 -15.79,100.99 -10.53,31.1 -25.71,58.28 -45.54,81.54 -19.83,23.26 -43.83,41.5 -71.99,54.72 -28.15,13.22 -59.61,19.83 -94.38,19.83 -34.77,0 -66.23,-6.61 -94.39,-19.83 -28.15,-13.22 -52.16,-31.46 -71.99,-54.72 -19.83,-23.26 -35.01,-50.44 -45.54,-81.54 -10.53,-31.09 -15.79,-64.76 -15.79,-100.99z"/>
          <path 
            fill="#54361B" 
            fillRule="nonzero"
            d="M1525.33 2188.4l0 29.38 -165.27 0 0 455.4 -66.1 0 0 -455.4 -66.11 0c-29.38,0 -52.03,6.73 -67.94,20.2 -15.92,13.46 -23.87,34.89 -23.87,64.27l-14.7 0 0 -55.09c0,-7.35 0.86,-14.57 2.58,-21.67 1.71,-7.1 4.89,-13.34 9.54,-18.73 4.66,-5.39 11.02,-9.79 19.1,-13.22 8.08,-3.43 18.49,-5.14 31.22,-5.14l341.55 0z"/>
          <path 
            fill="#54361B" 
            fillRule="nonzero"
            d="M1953.56 2188.4l0 29.38 -165.27 0 0 455.4 -66.1 0 0 -455.4 -66.11 0c-29.38,0 -52.03,6.73 -67.94,20.2 -15.92,13.46 -23.87,34.89 -23.87,64.27l-14.7 0 0 -55.09c0,-7.35 0.86,-14.57 2.58,-21.67 1.71,-7.1 4.89,-13.34 9.54,-18.73 4.66,-5.39 11.02,-9.79 19.1,-13.22 8.08,-3.43 18.49,-5.14 31.22,-5.14l341.55 0z"/>
          <path 
            fill="#54361B" 
            fillRule="nonzero"
            d="M2395.01 2673.18c-8.32,2.45 -18.12,3.67 -29.38,3.67 -8.32,0 -17.99,-0.98 -29.01,-2.94 -11.02,-1.95 -22.28,-6.24 -33.79,-12.85 -11.51,-6.61 -22.77,-16.28 -33.79,-29.01 -11.02,-12.73 -20.44,-29.63 -28.28,-50.69l-18.36 -47.74 -205.67 0 -58.76 139.56 -33.05 0 205.67 -484.78 22.03 0 161.6 392.96c5.87,13.72 11.38,25.35 16.52,34.89 5.14,9.55 10.9,17.27 17.26,23.14 6.37,5.88 13.22,10.29 20.57,13.22 7.34,2.94 16.16,4.9 26.44,5.88l0 14.69zm-367.26 -168.94l179.96 0 -88.14 -213.01 -91.82 213.01z"/>
          <path 
            fill="#54361B" 
            fillRule="nonzero"
            d="M2574.23 2423.44c10.29,0 21.92,-1.96 34.89,-5.87 12.98,-3.92 25.35,-9.92 37.1,-18 11.75,-8.08 21.67,-18.61 29.75,-31.58 8.08,-12.98 12.12,-28.77 12.12,-47.38 0,-19.1 -4.04,-35.5 -12.12,-49.21 -8.08,-13.71 -18,-24.73 -29.75,-33.06 -11.75,-8.32 -24.12,-14.44 -37.1,-18.36 -12.97,-3.92 -24.6,-5.88 -34.89,-5.88 -9.3,0 -18.97,0.74 -29.01,2.21 -10.04,1.47 -18.73,3.18 -26.07,5.14l0 194.65c7.34,1.96 16.03,3.67 26.07,5.14 10.04,1.47 19.71,2.2 29.01,2.2zm-3.67 25.71l-51.41 0 0 224.03 -66.11 0 0 -396.64c0,-22.04 -3.06,-39.79 -9.18,-53.25 -6.12,-13.47 -20.2,-20.2 -42.24,-20.2l-14.69 0 0 -14.69 190.98 0c15.67,0 34.03,1.34 55.09,4.04 21.05,2.69 41.13,8.69 60.23,17.99 19.09,9.31 35.25,22.65 48.48,40.03 13.22,17.39 19.83,40.77 19.83,70.15 0,21.06 -3.68,38.93 -11.02,53.62 -7.35,14.69 -16.77,26.81 -28.28,36.36 -11.51,9.55 -24.24,17.02 -38.19,22.4 -13.96,5.39 -27.3,9.55 -40.04,12.49l77.13 128.54c9.3,15.67 17.99,28.65 26.07,38.93 8.08,10.28 16.04,18.73 23.88,25.34 7.83,6.61 15.67,11.39 23.5,14.32 7.84,2.94 16.41,4.9 25.71,5.88l0 14.69c-3.92,1.96 -9.92,3.67 -18,5.14 -8.08,1.47 -16.77,2.21 -26.07,2.21 -12.73,0 -24.61,-1.72 -35.63,-5.15 -11.01,-3.42 -21.66,-9.3 -31.95,-17.62 -10.28,-8.33 -20.69,-19.35 -31.22,-33.06 -10.52,-13.71 -21.66,-30.6 -33.42,-50.68l-73.45 -124.87z"/>
          <path 
            fill="#54361B" 
            fillRule="nonzero"
            d="M1150.08 947.44c0,-33.23 -7.02,-60 -21.05,-80.31 -14.03,-20.3 -40.24,-30.46 -78.64,-30.46l-11.07 0 0 -22.15 71.99 0c36.18,0 65.9,5.91 89.16,17.72 23.26,11.82 43.39,28.06 60.37,48.74l387.67 481.81 0 -548.27 44.3 0 0 742.11 -22.15 0 -476.28 -592.58 0 581.5 -44.3 0 0 -598.11z"/>
          <path 
            fill="#54361B" 
            fillRule="nonzero"
            d="M2070.92 45.72c-193.83,79.79 -281.93,129.66 -376.35,212.78 -57.52,50.2 -113.37,124.01 -148.62,195.49l-17.62 35.9 -324.81 0 -325.16 0 -1.66 24.61c-3.66,57.51 -45.55,102.73 -104.39,112.7l-21.28 3.66 0 272.96c0,149.94 1.66,290.24 3.32,311.52 13.3,159.25 85.12,282.59 231.07,396.63 47.54,36.9 141.3,96.08 330.8,207.79 41.23,24.27 81.79,48.54 90.43,53.86l15.96 9.97 90.43 -54.19c49.87,-29.59 111.04,-65.83 135.65,-80.79 153.93,-91.43 237.38,-151.94 299.22,-216.77 87.77,-92.09 134.31,-195.82 142.62,-318.83 2.33,-32.25 1.33,-579.82 -0.99,-582.48 -0.67,-0.67 -8.98,-2.33 -18.95,-4.32 -55.53,-10.64 -94.76,-52.87 -101.74,-109.72l-2.66 -21.61 -22.61 -1.66 -22.94 -1.66 25.6 -31.59c13.97,-17.29 29.93,-37.9 35.58,-45.88l9.64 -13.96 -20.95 0c-11.63,0 -22.94,-1.33 -25.26,-2.99 -3.33,-2 4.98,-12.97 32.25,-41.89 57.84,-61.51 102.06,-132.99 127.66,-206.46 17.29,-50.21 33.91,-128.34 26.6,-127.34 -1.33,0.33 -28.93,10.97 -60.84,24.27l0 0zm0 53.86c0,6.65 -22.94,67.49 -33.58,88.77 -43.55,87.11 -106.72,157.92 -181.86,203.8 -13.96,8.64 -29.26,17.95 -33.91,20.95l-8.31 4.98 10.97 2.33c5.98,1.33 26.6,3.32 45.88,4.65 23.94,1.67 34.58,3.66 34.58,6.32 0,5.65 -30.26,39.9 -54.86,62.5 -40.56,36.58 -67.49,57.85 -110.38,86.11 -51.53,33.58 -83.11,50.54 -129,68.82 -40.56,15.96 -48.2,18.62 -48.2,14.96 0,-4.65 76.8,-117.36 103.06,-150.6 32.91,-42.56 76.47,-92.09 124.68,-142.96 46.21,-48.54 78.13,-84.45 78.13,-87.77 0,-3.66 -40.57,25.26 -73.15,52.53 -47.87,39.56 -92.75,81.78 -127.33,120.02 -33.25,36.9 -103.73,126.33 -116.7,147.94 -18.28,30.92 -0.33,-41.89 25.27,-102.06 36.24,-84.78 100.74,-167.57 183.85,-236.39 59.51,-48.87 156.93,-104.06 260.99,-146.95 19.28,-7.97 36.24,-15.62 38.23,-17.28 3.33,-3 11.64,-3.66 11.64,-0.67l0 0zm-559.87 442.51c-6.32,20.95 -15.63,71.81 -18.95,104.06 -3.99,35.91 -4.99,39.57 -17.29,58.18 -7.32,10.98 -27.93,41.56 -45.55,68.16 -39.9,59.84 -47.87,73.14 -44.22,73.14 4.66,0 64.17,-25.6 72.48,-31.25 3.99,-2.66 19.62,-24.94 34.91,-49.21 15.29,-24.27 27.59,-44.55 27.93,-44.88 0.33,-0.33 12.3,-2.99 26.93,-5.98 95.41,-19.29 206.79,-76.47 302.87,-155.26l27.93 -22.61 22.61 0 22.27 0 6.32 17.29c16.29,47.21 44.88,79.12 89.43,100.07l28.93 13.96 -1 287.58c-1.33,317.51 -0.33,300.55 -23.61,370.04 -19.61,58.85 -49.87,110.38 -92.75,157.59 -77.13,84.78 -147.95,133.65 -473.77,326.15l-33.91 19.94 -37.57 -22.27c-20.28,-12.3 -70.81,-42.22 -112.04,-66.83 -89.43,-53.19 -181.19,-110.37 -217.76,-135.64 -147.61,-102.73 -217.43,-196.16 -248.35,-332.47 -6.98,-31.58 -7.32,-37.57 -8.31,-317.5l-1.33 -284.92 9.31 -3.33c55.52,-20.61 96.74,-63.83 110.37,-115.7l3.99 -13.96 295.9 0c280.27,0 295.89,0.33 294.23,5.65l0 0z"/>
        </svg>
        <p className="text-muted-foreground">Sistema de Gestão de Processos</p>
      </div>
      
      <LoginForm />
    </div>
  );
};

export default LoginPage;
