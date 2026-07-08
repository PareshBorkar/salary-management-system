import { useState, type PropsWithChildren } from "react";
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
  Tooltip,
  Typography
} from "@mui/material";

const expandedSidebarWidth = 240;
const collapsedSidebarWidth = 72;

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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const sidebarWidth = isSidebarCollapsed ? collapsedSidebarWidth : expandedSidebarWidth;

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
          <IconButton
            edge="start"
            aria-label={isSidebarCollapsed ? "Expand navigation" : "Collapse navigation"}
            aria-pressed={isSidebarCollapsed}
            onClick={() => setIsSidebarCollapsed((currentValue) => !currentValue)}
          >
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
          width: sidebarWidth,
          display: { xs: "none", md: "block" },
          bgcolor: "background.paper",
          borderRight: "1px solid",
          borderColor: "divider",
          p: 2,
          transition: (theme) =>
            theme.transitions.create("width", {
              duration: theme.transitions.duration.shorter
            })
        }}
      >
        <Stack spacing={1}>
          {navItems.map((item) => (
            <Tooltip
              key={item.href}
              title={isSidebarCollapsed ? item.label : ""}
              placement="right"
            >
              <Link
                href={item.href}
                underline="none"
                aria-label={item.label}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: isSidebarCollapsed ? "center" : "flex-start",
                  gap: isSidebarCollapsed ? 0 : 1.25,
                  px: isSidebarCollapsed ? 0 : 1.5,
                  py: 1.25,
                  minHeight: 44,
                  borderRadius: 1,
                  color: "text.primary",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  "&:hover": {
                    bgcolor: "rgba(31, 111, 235, 0.08)"
                  }
                }}
              >
                {item.icon}
                {isSidebarCollapsed ? null : item.label}
              </Link>
            </Tooltip>
          ))}
        </Stack>
        {isSidebarCollapsed ? null : (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="caption" color="text.secondary">
              Compensation workspace
            </Typography>
          </>
        )}
      </Box>

      <Box
        component="main"
        sx={{
          minHeight: "100vh",
          pt: 10,
          pl: { xs: 2, md: `${sidebarWidth + 32}px` },
          pr: { xs: 2, md: 4 },
          pb: 4,
          transition: (theme) =>
            theme.transitions.create("padding-left", {
              duration: theme.transitions.duration.shorter
            })
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
