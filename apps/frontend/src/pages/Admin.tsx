import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Package, ShoppingCart, BarChart3, Trash2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import { formatWeiToEth, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [usersPage, setUsersPage] = useState(1);
  const [productsPage, setProductsPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);

  // Redirect if not admin
  if (user?.role !== "Admin") {
    navigate("/");
    return null;
  }

  const { data: stats } = useQuery({
    queryKey: ["adminStats"],
    queryFn: () => apiClient.adminGetStats(token!),
    enabled: Boolean(token),
    staleTime: 1000 * 60,
  });

  const { data: users } = useQuery({
    queryKey: ["adminUsers", usersPage],
    queryFn: () => apiClient.adminGetUsers(usersPage, 10, undefined, token!),
    enabled: Boolean(token),
  });

  const { data: products } = useQuery({
    queryKey: ["adminProducts", productsPage],
    queryFn: () => apiClient.adminGetProducts(productsPage, 10, token!),
    enabled: Boolean(token),
  });

  const { data: orders } = useQuery({
    queryKey: ["adminOrders", ordersPage],
    queryFn: () => apiClient.adminGetOrders(ordersPage, 10, undefined, token!),
    enabled: Boolean(token),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: string }) =>
      apiClient.adminUpdateUserRole(userId, role, token!),
    onSuccess: () => {
      toast.success("Đã cập nhật role");
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (productId: number) => apiClient.adminDeleteProduct(productId, token!),
    onSuccess: () => {
      toast.success("Đã xóa sản phẩm");
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

        {/* Overview Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{stats.overview.totalUsers}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold">{stats.overview.totalProducts}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{stats.overview.totalOrders}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatWeiToEth(stats.overview.totalRevenueWei)} ETH</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">User Management</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Email</th>
                      <th className="text-left p-3">Role</th>
                      <th className="text-left p-3">Wallet</th>
                      <th className="text-left p-3">Products</th>
                      <th className="text-left p-3">Orders</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users?.data.map((user) => (
                      <tr key={user.id} className="border-b">
                        <td className="p-3">{user.email}</td>
                        <td className="p-3">
                          <Badge>{user.role}</Badge>
                        </td>
                        <td className="p-3 font-mono text-xs">{user.walletAddress.slice(0, 10)}...</td>
                        <td className="p-3">{user._count.products}</td>
                        <td className="p-3">{user._count.buyerOrders + user._count.sellerOrders}</td>
                        <td className="p-3">
                          <Select
                            value={user.role}
                            onValueChange={(role) => updateRoleMutation.mutate({ userId: user.id, role })}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Buyer">Buyer</SelectItem>
                              <SelectItem value="Seller">Seller</SelectItem>
                              <SelectItem value="Admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {users && (
                <div className="flex justify-between items-center mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setUsersPage((p) => Math.max(1, p - 1))}
                    disabled={usersPage === 1}
                  >
                    Previous
                  </Button>
                  <span>
                    Page {usersPage} of {users.pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setUsersPage((p) => p + 1)}
                    disabled={usersPage >= users.pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Product Management</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Name</th>
                      <th className="text-left p-3">Seller</th>
                      <th className="text-left p-3">Price</th>
                      <th className="text-left p-3">Stock</th>
                      <th className="text-left p-3">Orders</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products?.data.map((product: any) => (
                      <tr key={product.id} className="border-b">
                        <td className="p-3">{product.name}</td>
                        <td className="p-3">{product.seller.email}</td>
                        <td className="p-3">{formatWeiToEth(product.priceWei)} ETH</td>
                        <td className="p-3">{product.stock}</td>
                        <td className="p-3">{product._count.orders}</td>
                        <td className="p-3">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (confirm("Delete this product?")) {
                                deleteProductMutation.mutate(product.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {products && (
                <div className="flex justify-between items-center mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setProductsPage((p) => Math.max(1, p - 1))}
                    disabled={productsPage === 1}
                  >
                    Previous
                  </Button>
                  <span>
                    Page {productsPage} of {products.pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setProductsPage((p) => p + 1)}
                    disabled={productsPage >= products.pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Order Management</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">ID</th>
                      <th className="text-left p-3">Buyer</th>
                      <th className="text-left p-3">Product</th>
                      <th className="text-left p-3">Total</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders?.data.map((order: any) => (
                      <tr key={order.id} className="border-b">
                        <td className="p-3">#{order.id}</td>
                        <td className="p-3">{order.buyer.email}</td>
                        <td className="p-3">{order.product.name}</td>
                        <td className="p-3">{formatWeiToEth(order.totalWei)} ETH</td>
                        <td className="p-3">
                          <Badge>{order.status}</Badge>
                        </td>
                        <td className="p-3">{formatDate(order.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {orders && (
                <div className="flex justify-between items-center mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setOrdersPage((p) => Math.max(1, p - 1))}
                    disabled={ordersPage === 1}
                  >
                    Previous
                  </Button>
                  <span>
                    Page {ordersPage} of {orders.pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setOrdersPage((p) => p + 1)}
                    disabled={ordersPage >= orders.pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats">
            {stats && (
              <div className="space-y-6">
                <Card className="p-6">
                  <h2 className="text-2xl font-semibold mb-4">Users by Role</h2>
                  <div className="space-y-2">
                    {stats.usersByRole.map((item) => (
                      <div key={item.role} className="flex justify-between items-center">
                        <span className="font-medium">{item.role}</span>
                        <Badge variant="outline">{item.count}</Badge>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <h2 className="text-2xl font-semibold mb-4">Orders by Status</h2>
                  <div className="space-y-2">
                    {stats.ordersByStatus.map((item) => (
                      <div key={item.status} className="flex justify-between items-center">
                        <span className="font-medium">{item.status}</span>
                        <Badge variant="outline">{item.count}</Badge>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <h2 className="text-2xl font-semibold mb-4">Recent Orders</h2>
                  <div className="space-y-3">
                    {stats.recentOrders.map((order) => (
                      <div key={order.id} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <p className="font-medium">{order.productName}</p>
                          <p className="text-sm text-muted-foreground">{order.buyerEmail}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatWeiToEth(order.totalWei)} ETH</p>
                          <Badge className="mt-1">{order.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default Admin;
