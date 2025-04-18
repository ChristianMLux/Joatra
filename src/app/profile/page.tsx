"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { getUserProfile } from "@/lib/firebase/firebase";
import { UserProfile } from "@/lib/types";
import LoadingSpinner from "@/components/layout/MuiLoadingSpinner";
import MuiButton from "@/components/ui/Button";
import Title from "@/components/ui/Title";
import {
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Paper,
  Grid,
  Avatar,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import HomeIcon from "@mui/icons-material/Home";
import SchoolIcon from "@mui/icons-material/School";
import WorkIcon from "@mui/icons-material/Work";
import CodeIcon from "@mui/icons-material/Code";
import LanguageIcon from "@mui/icons-material/Language";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { formatDate } from "@/lib/utils";

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userProfile = await getUserProfile(user.uid);
        setProfile(userProfile);
      } catch (error) {
        console.error("Fehler beim Laden des Profils:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  if (loading) {
    return <LoadingSpinner message="Profil wird geladen..." />;
  }

  if (!profile) {
    return (
      <Box className="max-w-4xl mx-auto text-center py-12">
        <Title text="Kein Profil gefunden" className="mb-6" />
        <Typography variant="body1" color="textSecondary" paragraph>
          Du hast noch kein Profil erstellt. Um den CV-Generator nutzen zu
          können, musst du zunächst dein Profil anlegen.
        </Typography>
        <MuiButton
          variant="primary"
          onClick={() => router.push("/profile/create")}
          className="mt-4"
        >
          Profil erstellen
        </MuiButton>
      </Box>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Box className="flex justify-between items-center mb-6">
        <Title text="Mein Profil" className="mb-0" />
        <Link href="/profile/edit">
          <MuiButton variant="outline">Profil bearbeiten</MuiButton>
        </Link>
      </Box>

      <Paper elevation={0} className="mb-6 rounded-lg border border-gray-200">
        <Box className="p-6">
          <Box className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: "primary.main",
                fontSize: "2rem",
              }}
            >
              {`${profile.personalDetails.firstName.charAt(0)}${profile.personalDetails.lastName.charAt(0)}`}
            </Avatar>
            <Box className="flex-grow">
              <Typography variant="h4" component="h1" gutterBottom>
                {profile.personalDetails.firstName}{" "}
                {profile.personalDetails.lastName}
              </Typography>

              <Box className="flex flex-col gap-1 text-gray-600 mb-4">
                {profile.personalDetails.email && (
                  <Box className="flex items-center">
                    <EmailIcon fontSize="small" className="mr-2" />
                    <Typography variant="body2">
                      {profile.personalDetails.email}
                    </Typography>
                  </Box>
                )}
                {profile.personalDetails.phone && (
                  <Box className="flex items-center">
                    <PhoneIcon fontSize="small" className="mr-2" />
                    <Typography variant="body2">
                      {profile.personalDetails.phone}
                    </Typography>
                  </Box>
                )}
                {profile.personalDetails.address && (
                  <Box className="flex items-center">
                    <HomeIcon fontSize="small" className="mr-2" />
                    <Typography variant="body2">
                      {profile.personalDetails.address}
                      {profile.personalDetails.postalCode ||
                      profile.personalDetails.city
                        ? ", "
                        : ""}
                      {profile.personalDetails.postalCode}{" "}
                      {profile.personalDetails.city}
                      {profile.personalDetails.country
                        ? `, ${profile.personalDetails.country}`
                        : ""}
                    </Typography>
                  </Box>
                )}
              </Box>

              {profile.summary && (
                <Typography variant="body1" className="mt-2 text-gray-700">
                  {profile.summary}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={4}>
        {/* Ausbildung */}
        <Grid>
          <Paper
            elevation={0}
            className="rounded-lg border border-gray-200 h-full"
          >
            <Box className="p-6">
              <Box className="flex items-center mb-4">
                <SchoolIcon className="mr-2 text-blue-600" />
                <Typography variant="h5" component="h2">
                  Ausbildung
                </Typography>
              </Box>
              <Divider className="mb-4" />

              {profile.education.length === 0 ? (
                <Typography color="textSecondary" className="italic">
                  Keine Ausbildungsdaten vorhanden
                </Typography>
              ) : (
                <List className="space-y-4">
                  {profile.education.map((edu, index) => (
                    <ListItem
                      key={index}
                      disableGutters
                      className="flex flex-col items-start p-0 mb-4"
                    >
                      <Typography variant="subtitle1" className="font-medium">
                        {edu.degree} in {edu.field}
                      </Typography>
                      <Typography variant="body2" color="primary.main">
                        {edu.institution}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {formatDate(edu.startDate)} -{" "}
                        {edu.ongoing ? "Heute" : formatDate(edu.endDate)}
                      </Typography>
                      {edu.description && (
                        <Typography
                          variant="body2"
                          className="mt-1 text-gray-600"
                        >
                          {edu.description}
                        </Typography>
                      )}
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Berufserfahrung */}
        <Grid>
          <Paper
            elevation={0}
            className="rounded-lg border border-gray-200 h-full"
          >
            <Box className="p-6">
              <Box className="flex items-center mb-4">
                <WorkIcon className="mr-2 text-blue-600" />
                <Typography variant="h5" component="h2">
                  Berufserfahrung
                </Typography>
              </Box>
              <Divider className="mb-4" />

              {profile.experience.length === 0 ? (
                <Typography color="textSecondary" className="italic">
                  Keine Berufserfahrung vorhanden
                </Typography>
              ) : (
                <List className="space-y-4">
                  {profile.experience.map((exp, index) => (
                    <ListItem
                      key={index}
                      disableGutters
                      className="flex flex-col items-start p-0 mb-4"
                    >
                      <Typography variant="subtitle1" className="font-medium">
                        {exp.position}
                      </Typography>
                      <Typography variant="body2" color="primary.main">
                        {exp.company}
                        {exp.location && ` • ${exp.location}`}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {formatDate(exp.startDate)} -{" "}
                        {exp.ongoing ? "Heute" : formatDate(exp.endDate)}
                      </Typography>
                      {exp.description && (
                        <Typography
                          variant="body2"
                          className="mt-1 text-gray-600"
                        >
                          {exp.description}
                        </Typography>
                      )}
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Fähigkeiten */}
        <Grid>
          <Paper
            elevation={0}
            className="rounded-lg border border-gray-200 h-full"
          >
            <Box className="p-6">
              <Box className="flex items-center mb-4">
                <CodeIcon className="mr-2 text-blue-600" />
                <Typography variant="h5" component="h2">
                  Fähigkeiten
                </Typography>
              </Box>
              <Divider className="mb-4" />

              {profile.skills.length === 0 ? (
                <Typography color="textSecondary" className="italic">
                  Keine Fähigkeiten vorhanden
                </Typography>
              ) : (
                <Box className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill.name}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Sprachen */}
        <Grid>
          <Paper
            elevation={0}
            className="rounded-lg border border-gray-200 h-full"
          >
            <Box className="p-6">
              <Box className="flex items-center mb-4">
                <LanguageIcon className="mr-2 text-blue-600" />
                <Typography variant="h5" component="h2">
                  Sprachen
                </Typography>
              </Box>
              <Divider className="mb-4" />

              {profile.languages.length === 0 ? (
                <Typography color="textSecondary" className="italic">
                  Keine Sprachen vorhanden
                </Typography>
              ) : (
                <List>
                  {profile.languages.map((language, index) => (
                    <ListItem key={index} disableGutters>
                      <ListItemText
                        primary={language.name}
                        secondary={language.level}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Interessen */}
        {profile.interests && profile.interests.length > 0 && (
          <Grid>
            <Paper elevation={0} className="rounded-lg border border-gray-200">
              <Box className="p-6">
                <Box className="flex items-center mb-4">
                  <FavoriteIcon className="mr-2 text-blue-600" />
                  <Typography variant="h5" component="h2">
                    Interessen
                  </Typography>
                </Box>
                <Divider className="mb-4" />

                <Box className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, index) => (
                    <Chip key={index} label={interest} variant="outlined" />
                  ))}
                </Box>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>

      <Box className="mt-8 flex justify-center">
        <Link href="/cv-generator">
          <MuiButton variant="primary" size="lg">
            CV-Generator starten
          </MuiButton>
        </Link>
      </Box>
    </div>
  );
}
