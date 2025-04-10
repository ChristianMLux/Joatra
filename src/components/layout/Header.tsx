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
import { useState, useEffect } from "react";

export default function MuiHeader() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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

  const getCurrentTabValue = () => {
    if (pathname === "/") return "/";
    if (pathname.startsWith("/cv-generator")) return "/cv-generator";
    if (pathname.startsWith("/recruiters")) return "/recruiters";
    if (pathname.startsWith("/stats")) return "/stats";
    return false;
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

            {isClient && !loading && user && (
              <Tabs
                value={getCurrentTabValue()}
                sx={{
                  "& .MuiTab-root": {
                    minWidth: "auto",
                    fontWeight: "medium",
                    px: 2,
                  },
                  minHeight: "48px",
                }}
              >
                <Tab
                  label="Dashboard"
                  value="/"
                  component={Link}
                  href="/"
                  id="tab-dashboard"
                />
                <Tab
                  label="CV-Generator"
                  value="/cv-generator"
                  component={Link}
                  href="/cv-generator"
                  id="tab-cv-generator"
                />
                <Tab
                  label="Vermittler"
                  value="/recruiters"
                  component={Link}
                  href="/recruiters"
                  id="tab-recruiters"
                />
                <Tab
                  label="Statistiken"
                  value="/stats"
                  component={Link}
                  href="/stats"
                  id="tab-stats"
                />
              </Tabs>
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              minHeight: "40px",
            }}
          >
            {isClient && !loading && (
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
                        id="account-button"
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
            {(!isClient || loading) && <Box sx={{ width: "180px" }}></Box>}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
