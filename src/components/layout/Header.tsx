"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { logout } from "@/lib/firebase/firebase";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import MuiButton from "@/components/ui/Button";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Avatar,
  Tooltip,
  Tab,
  Tabs,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";

export default function MuiHeader() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Erfolgreich abgemeldet");
      router.push("/login");
    } catch (error) {
      toast.error("Fehler beim Abmelden");
    } finally {
      setAnchorEl(null);
    }
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    router.push("/profile");
    setAnchorEl(null);
  };

  return (
    <AppBar
      position="static"
      color="default"
      elevation={1}
      sx={{ backgroundColor: "white" }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
          {/* Logo und Navigation */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography
              variant="h5"
              component={Link}
              href="/"
              sx={{
                fontWeight: 700,
                color: "primary.main",
                textDecoration: "none",
                letterSpacing: -0.5,
                mr: 4,
              }}
            >
              Joatra
            </Typography>

            {!loading && user && (
              <Tabs
                value={pathname}
                sx={{
                  "& .MuiTab-root": {
                    minWidth: "auto",
                    fontWeight: "medium",
                    px: 2,
                  },
                }}
              >
                <Tab label="Dashboard" value="/" component={Link} href="/" />
                <Tab
                  label="Vermittler"
                  value={
                    pathname.startsWith("/recruiters")
                      ? "/recruiters"
                      : undefined
                  }
                  component={Link}
                  href="/recruiters"
                />
                <Tab
                  label="Statistiken"
                  value="/stats"
                  component={Link}
                  href="/stats"
                />
              </Tabs>
            )}
          </Box>

          {/* Benutzeraktionen */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {!loading && (
              <>
                {user ? (
                  <>
                    <MuiButton
                      variant="primary"
                      size="sm"
                      component={Link}
                      href="/jobs/add"
                      startIcon={<AddIcon />}
                      sx={{ mr: 2 }}
                    >
                      Neue Bewerbung
                    </MuiButton>

                    <Tooltip title="Konto-Menü">
                      <IconButton
                        onClick={handleMenu}
                        size="small"
                        sx={{ ml: 1 }}
                        aria-controls={open ? "account-menu" : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? "true" : undefined}
                      >
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: "primary.light",
                            fontSize: "0.875rem",
                            fontWeight: "medium",
                          }}
                        >
                          {user.email?.charAt(0).toUpperCase()}
                        </Avatar>
                      </IconButton>
                    </Tooltip>
                    <Menu
                      id="account-menu"
                      anchorEl={anchorEl}
                      open={open}
                      onClose={handleClose}
                      MenuListProps={{
                        "aria-labelledby": "account-button",
                      }}
                      transformOrigin={{ horizontal: "right", vertical: "top" }}
                      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                    >
                      <MenuItem onClick={handleProfileClick}>Profil</MenuItem>
                      <Divider />
                      <MenuItem onClick={handleLogout}>Abmelden</MenuItem>
                    </Menu>
                  </>
                ) : (
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <MuiButton
                      variant="outline"
                      size="sm"
                      component={Link}
                      href="/login"
                    >
                      Anmelden
                    </MuiButton>
                    <MuiButton
                      variant="primary"
                      size="sm"
                      component={Link}
                      href="/register"
                    >
                      Registrieren
                    </MuiButton>
                  </Box>
                )}
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
