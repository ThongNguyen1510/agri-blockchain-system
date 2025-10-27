import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { WalletProvider } from "@/context/WalletContext";
import RequireAuth from "@/components/RequireAuth";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Orders from "./pages/Orders";
import Trace from "./pages/Trace";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import SellerDashboard from "./pages/SellerDashboard";
import SellerProducts from "./pages/SellerProducts";
import SellerProductsNew from "./pages/SellerProductsNew";
import SellerProductsEdit from "./pages/SellerProductsEdit";
import SellerBatches from "./pages/SellerBatches";
import SellerBatchesNew from "./pages/SellerBatchesNew";
import SellerOrders from "./pages/SellerOrders";
import UserProfile from "./pages/UserProfile";
import DebugAuth from "./pages/DebugAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <WalletProvider>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/products"
                element={
                  <RequireAuth>
                    <Products />
                  </RequireAuth>
                }
              />
              <Route
                path="/product/:id"
                element={
                  <RequireAuth>
                    <ProductDetail />
                  </RequireAuth>
                }
              />
              <Route
                path="/orders"
                element={
                  <RequireAuth>
                    <Orders />
                  </RequireAuth>
                }
              />
              <Route
                path="/trace"
                element={
                  <RequireAuth>
                    <Trace />
                  </RequireAuth>
                }
              />
              <Route
                path="/trace/:batchId"
                element={
                  <RequireAuth>
                    <Trace />
                  </RequireAuth>
                }
              />
              
              {/* Seller Routes */}
              <Route
                path="/seller/dashboard"
                element={
                  <RequireAuth>
                    <SellerDashboard />
                  </RequireAuth>
                }
              />
              <Route
                path="/seller/products"
                element={
                  <RequireAuth>
                    <SellerProducts />
                  </RequireAuth>
                }
              />
              <Route
                path="/seller/products/new"
                element={
                  <RequireAuth>
                    <SellerProductsNew />
                  </RequireAuth>
                }
              />
              <Route
                path="/seller/products/:id/edit"
                element={
                  <RequireAuth>
                    <SellerProductsEdit />
                  </RequireAuth>
                }
              />
              <Route
                path="/seller/orders"
                element={
                  <RequireAuth>
                    <SellerOrders />
                  </RequireAuth>
                }
              />
              <Route
                path="/seller/batches"
                element={
                  <RequireAuth>
                    <SellerBatches />
                  </RequireAuth>
                }
              />
              <Route
                path="/seller/batches/new"
                element={
                  <RequireAuth>
                    <SellerBatchesNew />
                  </RequireAuth>
                }
              />
              
              {/* User Profile */}
              <Route
                path="/profile"
                element={
                  <RequireAuth>
                    <UserProfile />
                  </RequireAuth>
                }
              />
              
              {/* Debug Auth */}
              <Route path="/debug-auth" element={<DebugAuth />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </WalletProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
