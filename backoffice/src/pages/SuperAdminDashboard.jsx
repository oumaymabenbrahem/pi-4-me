import React, { useState, useEffect } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import axios from "axios";
import Cookies from "js-cookie";
import {
  CircularProgress,
  Alert,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    newUsers: 0,
    totalProducts: 0,
    totalSales: 0,
    revenue: 0,
    userGrowth: [],
    salesData: [],
    adminStats: [],
    productDistribution: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = Cookies.get("authToken");
        const response = await axios.get("http://localhost:5000/api/superadmin/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setStats(response.data.stats);
        } else {
          setError("Failed to load dashboard data");
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("An error occurred while fetching dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="white">
                  Super Admin Dashboard
                </MDTypography>
              </MDBox>
              <MDBox pt={3} px={3}>
                {loading ? (
                  <MDBox display="flex" justifyContent="center" my={5}>
                    <CircularProgress color="info" />
                  </MDBox>
                ) : error ? (
                  <Alert severity="error">{error}</Alert>
                ) : (
                  <Grid container spacing={3}>
                    {/* Stats Cards */}
                    <Grid item xs={12} md={3}>
                      <Card>
                        <MDBox p={3} textAlign="center">
                          <MDTypography variant="h1" color="info">
                            {stats.totalUsers}
                          </MDTypography>
                          <MDTypography variant="h6" color="text">
                            Total Users
                          </MDTypography>
                        </MDBox>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Card>
                        <MDBox p={3} textAlign="center">
                          <MDTypography variant="h1" color="success">
                            {stats.totalAdmins}
                          </MDTypography>
                          <MDTypography variant="h6" color="text">
                            Total Admins
                          </MDTypography>
                        </MDBox>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Card>
                        <MDBox p={3} textAlign="center">
                          <MDTypography variant="h1" color="warning">
                            {stats.totalProducts}
                          </MDTypography>
                          <MDTypography variant="h6" color="text">
                            Total Products
                          </MDTypography>
                        </MDBox>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Card>
                        <MDBox p={3} textAlign="center">
                          <MDTypography variant="h1" color="error">
                            ${stats.revenue.toLocaleString()}
                          </MDTypography>
                          <MDTypography variant="h6" color="text">
                            Total Revenue
                          </MDTypography>
                        </MDBox>
                      </Card>
                    </Grid>

                    {/* Admin Performance Table */}
                    <Grid item xs={12}>
                      <Card>
                        <MDBox p={3}>
                          <MDTypography variant="h6" gutterBottom>
                            Admin Performance
                          </MDTypography>
                          {console.log("Admin Stats:", stats.adminStats)}
                          <TableContainer>
                            <Table>
                              <TableHead>
                                <TableRow>
                                  <TableCell>Admin Name</TableCell>
                                  <TableCell align="right">Total Clients</TableCell>
                                  <TableCell align="right">Total Orders</TableCell>
                                  <TableCell align="right">Total Revenue</TableCell>
                                  <TableCell align="right">Actions</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {stats.adminStats && stats.adminStats.length > 0 ? (
                                  stats.adminStats.map((admin) => (
                                    <TableRow key={admin.adminId}>
                                      <TableCell>{admin.adminName || "N/A"}</TableCell>
                                      <TableCell align="right">{admin.totalClients || 0}</TableCell>
                                      <TableCell align="right">{admin.totalOrders || 0}</TableCell>
                                      <TableCell align="right">
                                        ${(admin.totalRevenue || 0).toLocaleString()}
                                      </TableCell>
                                      <TableCell align="right">
                                        <Button
                                          component={Link}
                                          to={`/admin-details/${admin.adminId}`}
                                          variant="contained"
                                          color="info"
                                          size="small"
                                        >
                                          View Details
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))
                                ) : (
                                  <TableRow>
                                    <TableCell colSpan={5} align="center">
                                      No admin data available
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </MDBox>
                      </Card>
                    </Grid>

                    {/* User Growth Chart */}
                    <Grid item xs={12} md={6}>
                      <Card>
                        <MDBox p={3}>
                          <MDTypography variant="h6" gutterBottom>
                            User Growth
                          </MDTypography>
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={stats.userGrowth}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Line type="monotone" dataKey="users" stroke="#8884d8" />
                            </LineChart>
                          </ResponsiveContainer>
                        </MDBox>
                      </Card>
                    </Grid>

                    {/* Sales Distribution Chart */}
                    <Grid item xs={12} md={6}>
                      <Card>
                        <MDBox p={3}>
                          <MDTypography variant="h6" gutterBottom>
                            Sales Distribution
                          </MDTypography>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stats.salesData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="sales" fill="#82ca9d" />
                            </BarChart>
                          </ResponsiveContainer>
                        </MDBox>
                      </Card>
                    </Grid>

                    {/* Product Distribution */}
                    <Grid item xs={12} md={6}>
                      <Card>
                        <MDBox p={3}>
                          <MDTypography variant="h6" gutterBottom>
                            Product Distribution
                          </MDTypography>
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={stats.productDistribution}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) =>
                                  `${name} ${(percent * 100).toFixed(0)}%`
                                }
                              >
                                {stats.productDistribution.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                  />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </MDBox>
                      </Card>
                    </Grid>

                    {/* Action Buttons */}
                    <Grid item xs={12}>
                      <Card>
                        <MDBox p={3} display="flex" justifyContent="space-between">
                          <Button
                            component={Link}
                            to="/admin-requests"
                            variant="contained"
                            color="primary"
                          >
                            View Admin Verification Requests
                          </Button>
                          <Button
                            component={Link}
                            to="/admin-management"
                            variant="contained"
                            color="success"
                          >
                            Manage Admins
                          </Button>
                          <Button component={Link} to="/user-list" variant="contained" color="info">
                            View All Users
                          </Button>
                        </MDBox>
                      </Card>
                    </Grid>
                  </Grid>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default SuperAdminDashboard;
