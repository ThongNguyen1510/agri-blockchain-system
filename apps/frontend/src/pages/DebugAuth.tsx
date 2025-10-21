import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DebugAuth = () => {
  const { token, user, isLoading } = useAuth();
  const [localStorageData, setLocalStorageData] = useState<any>(null);

  useEffect(() => {
    const raw = localStorage.getItem("agrochain.auth");
    if (raw) {
      try {
        setLocalStorageData(JSON.parse(raw));
      } catch (error) {
        setLocalStorageData({ error: "Failed to parse localStorage data" });
      }
    }
  }, []);

  const clearAuth = () => {
    localStorage.removeItem("agrochain.auth");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Debug Authentication</h1>
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">AuthContext State</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">Loading:</span>
              <Badge variant={isLoading ? "destructive" : "default"}>
                {isLoading ? "Loading" : "Loaded"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Token:</span>
              <Badge variant={token ? "default" : "destructive"}>
                {token ? "Exists" : "Missing"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">User:</span>
              <Badge variant={user ? "default" : "destructive"}>
                {user ? "Exists" : "Missing"}
              </Badge>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Token Details</h2>
          <div className="space-y-2">
            <div>
              <span className="font-medium">Token (first 50 chars):</span>
              <p className="font-mono text-sm bg-muted p-2 rounded mt-1">
                {token ? `${token.substring(0, 50)}...` : "No token"}
              </p>
            </div>
            <div>
              <span className="font-medium">Token Length:</span>
              <p className="font-mono text-sm bg-muted p-2 rounded mt-1">
                {token ? token.length : 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">User Details</h2>
          <pre className="bg-muted p-4 rounded text-sm overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">LocalStorage Data</h2>
          <pre className="bg-muted p-4 rounded text-sm overflow-auto">
            {JSON.stringify(localStorageData, null, 2)}
          </pre>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-x-4">
            <Button onClick={clearAuth} variant="destructive">
              Clear Auth & Reload
            </Button>
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DebugAuth;
