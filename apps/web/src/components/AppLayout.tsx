import type { PropsWithChildren } from "react";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  IconButton,
  Link,
  Stack,
  Toolbar,
  Typography
} from "@mui/material";

const navItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: <DashboardOutlinedIcon fontSize="small" />
  },
  {
    label: "Employees",
    href: "/employees",
    icon: <GroupsOutlinedIcon fontSize="small" />
  }
];

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: "background.paper",
          color: "text.primary",
          borderBottom: "1px solid",
          borderColor: "divider",
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar sx={{ gap: 2 }}>
          <IconButton edge="start" aria-label="Open navigation">
            <MenuOutlinedIcon />
          </IconButton>
          <Typography variant="h2" sx={{ fontSize: "1.05rem", flex: 1 }}>
            Salary Management
          </Typography>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box textAlign="right">
              <Typography fontWeight={700} lineHeight={1.1}>
                ACME
              </Typography>
              <Typography variant="caption" color="text.secondary">
                HR Manager
              </Typography>
            </Box>
            <Avatar sx={{ width: 36, height: 36 }}>A</Avatar>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box
        component="aside"
        sx={{
          position: "fixed",
          top: 64,
          left: 0,
          bottom: 0,
          width: 240,
          display: { xs: "none", md: "block" },
          bgcolor: "background.paper",
          borderRight: "1px solid",
          borderColor: "divider",
          p: 2
        }}
      >
        <Stack spacing={1}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              underline="none"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                px: 1.5,
                py: 1.25,
                borderRadius: 1,
                color: "text.primary",
                fontWeight: 700,
                "&:hover": {
                  bgcolor: "rgba(31, 111, 235, 0.08)"
                }
              }}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Typography variant="caption" color="text.secondary">
          Compensation workspace
        </Typography>
      </Box>

      <Box
        component="main"
        sx={{
          minHeight: "100vh",
          pt: 10,
          pl: { xs: 2, md: "272px" },
          pr: { xs: 2, md: 4 },
          pb: 4
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
