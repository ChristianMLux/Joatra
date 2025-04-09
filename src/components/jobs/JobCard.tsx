"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateJob, deleteJob } from "@/lib/firebase/firebase";
import MuiStatusBadge from "./StatusBadge";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { JobCardProps } from "@/lib/types";
import { Timestamp } from "firebase/firestore";
import MuiButton from "@/components/ui/Button";

import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Divider,
  Chip,
  Menu,
  MenuItem,
  IconButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PersonIcon from "@mui/icons-material/Person";
import LinkIcon from "@mui/icons-material/Link";
import BusinessIcon from "@mui/icons-material/Business";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const cardShadow =
  "0px 2px 4px -1px rgba(0,0,0,0.06), 0px 4px 6px -1px rgba(0,0,0,0.1)";
const cardHoverShadow =
  "0px 6px 10px -2px rgba(0,0,0,0.1), 0px 4px 6px -1px rgba(0,0,0,0.05)";

export default function MuiJobCard({
  job,
  onJobUpdate,
  viewMode,
}: JobCardProps) {
  const [statusAnchorEl, setStatusAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const statusMenuOpen = Boolean(statusAnchorEl);
  const actionsMenuOpen = Boolean(menuAnchorEl);

  const formatDate = (date: string | Date | Timestamp | undefined) => {
    if (!date) return "Kein Datum";

    let dateObj: Date;

    if (typeof date === "object" && "toDate" in date) {
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      dateObj = new Date(date);
    }

    if (isNaN(dateObj.getTime())) {
      return "Ungültiges Datum";
    }

    return format(dateObj, "dd. MMMM yyyy", { locale: de });
  };

  const handleStatusChange = async (
    newStatus: "Beworben" | "Interview" | "Abgelehnt" | "Angenommen"
  ) => {
    setStatusAnchorEl(null);

    try {
      await updateJob(job.id!, { status: newStatus });
      onJobUpdate();
      toast.success(`Status auf "${newStatus}" geändert`);
    } catch (error) {
      console.error("Fehler beim Ändern des Status:", error);
      toast.error("Fehler beim Ändern des Status");
    }
  };

  const handleDelete = async () => {
    setMenuAnchorEl(null);

    if (
      window.confirm(
        "Bist du sicher, dass du diese Bewerbung löschen möchtest?"
      )
    ) {
      setIsDeleting(true);

      try {
        await deleteJob(job.id!);
        onJobUpdate();
        toast.success("Bewerbung erfolgreich gelöscht");
      } catch (error) {
        console.error("Fehler beim Löschen der Bewerbung:", error);
        toast.error("Fehler beim Löschen der Bewerbung");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleEdit = () => {
    setMenuAnchorEl(null);
    router.push(`/jobs/${job.id}`);
  };

  const cardStyleProps = {
    overflow: "hidden",
    border: "none",
    borderRadius: 2,
    boxShadow: cardShadow,
    transition: "box-shadow 0.3s",
    "&:hover": {
      boxShadow: cardHoverShadow,
    },
  };

  if (viewMode === "compact") {
    return (
      <Card
        elevation={0}
        sx={{
          ...cardStyleProps,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CardContent sx={{ pb: 1, flexGrow: 1 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 1,
            }}
          >
            <Typography variant="h6" component="h3" noWrap title={job.jobTitle}>
              {job.jobTitle}
            </Typography>
            <MuiStatusBadge status={job.status} />
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            noWrap
            title={job.company + (job.location ? ` • ${job.location}` : "")}
          >
            {job.company}
            {job.location ? ` • ${job.location}` : ""}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", mt: 1, mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {formatDate(job.applicationDate)}
            </Typography>
            {job.salary?.min && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  ml: 1,
                  pl: 1,
                  borderLeft: "1px solid",
                  borderColor: "divider",
                }}
              >
                {job.salary.min}
                {job.salary.max ? `-${job.salary.max}` : "+"}{" "}
                {job.salary.currency || "€"}
              </Typography>
            )}
          </Box>
        </CardContent>

        <CardActions sx={{ pt: 0, justifyContent: "space-between" }}>
          <MuiButton
            variant="outline"
            size="sm"
            fullWidth
            onClick={() => router.push(`/jobs/${job.id}`)}
          >
            Details
          </MuiButton>
          <MuiButton
            variant={
              job.status === "Abgelehnt"
                ? "danger"
                : job.status === "Angenommen"
                  ? "success"
                  : "primary"
            }
            size="sm"
            onClick={(e) => setStatusAnchorEl(e.currentTarget)}
          >
            Status
          </MuiButton>
        </CardActions>

        <Menu
          anchorEl={statusAnchorEl}
          open={statusMenuOpen}
          onClose={() => setStatusAnchorEl(null)}
        >
          {["Beworben", "Interview", "Abgelehnt", "Angenommen"].map(
            (status) => (
              <MenuItem
                key={status}
                onClick={() => handleStatusChange(status as any)}
                selected={job.status === status}
                dense
              >
                {status}
              </MenuItem>
            )
          )}
        </Menu>
      </Card>
    );
  }

  return (
    <Card
      elevation={0}
      sx={{
        ...cardStyleProps,
        mb: 3,
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="h5" component="h3" gutterBottom>
              {job.jobTitle}
            </Typography>
            <Typography variant="subtitle1" color="text.primary">
              {job.company}
              {job.location && (
                <Typography
                  variant="body2"
                  component="span"
                  color="text.secondary"
                  sx={{ ml: 1 }}
                >
                  • {job.location}
                </Typography>
              )}
            </Typography>
          </Box>
          <MuiStatusBadge status={job.status} />
        </Box>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 3,
            my: 2,
            "& .MuiBox-root": {
              display: "flex",
              alignItems: "center",
            },
            "& .MuiSvgIcon-root": {
              color: "text.secondary",
              mr: 1,
              fontSize: "1rem",
            },
          }}
        >
          <Box>
            <CalendarTodayIcon />
            <Typography variant="body2">
              <Typography variant="body2" component="span" fontWeight="medium">
                Bewerbung:
              </Typography>{" "}
              {formatDate(job.applicationDate)}
            </Typography>
          </Box>

          {job.salary?.min && (
            <Box>
              <AttachMoneyIcon />
              <Typography variant="body2">
                <Typography
                  variant="body2"
                  component="span"
                  fontWeight="medium"
                >
                  Gehalt:
                </Typography>{" "}
                {job.salary.min}
                {job.salary.max ? `-${job.salary.max}` : "+"}{" "}
                {job.salary.currency || "€"}
              </Typography>
            </Box>
          )}

          {job.contactPerson?.name && (
            <Box>
              <PersonIcon />
              <Typography variant="body2">
                <Typography
                  variant="body2"
                  component="span"
                  fontWeight="medium"
                >
                  Kontakt:
                </Typography>{" "}
                {job.contactPerson.name}
                {job.contactPerson.position && (
                  <Typography
                    variant="body2"
                    component="span"
                    color="text.secondary"
                    sx={{ ml: 0.5 }}
                  >
                    ({job.contactPerson.position})
                  </Typography>
                )}
              </Typography>
            </Box>
          )}
        </Box>

        {job.jobUrl && (
          <Box sx={{ mt: 2 }}>
            <Link
              href={job.jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              <Chip
                icon={<LinkIcon />}
                label="Stelle ansehen"
                clickable
                color="primary"
                variant="outlined"
                size="small"
              />
            </Link>
          </Box>
        )}

        {job.techStack && job.techStack.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Tech Stack:
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {job.techStack.map((tech, index) => (
                <Chip
                  key={index}
                  label={tech}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        )}

        {job.recruiterId && job.recruiterName && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Vermittelt durch:
            </Typography>
            <Link
              href={`/recruiters/${job.recruiterId}`}
              style={{ color: "inherit", textDecoration: "none" }}
            >
              <Chip
                icon={<BusinessIcon />}
                label={job.recruiterName}
                clickable
                color="primary"
                variant="outlined"
                size="small"
              />
            </Link>
          </Box>
        )}

        {job.status === "Abgelehnt" && job.rejectionReason && (
          <Box
            sx={{
              mt: 3,
              p: 2,
              bgcolor: "error.light",
              borderRadius: 1,
              color: "error.dark",
            }}
          >
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Ablehnungsgrund:
            </Typography>
            <Typography variant="body2" whiteSpace="pre-wrap">
              {job.rejectionReason}
            </Typography>
          </Box>
        )}

        {job.notes && (
          <Box
            sx={{
              mt: 3,
              p: 2,
              bgcolor: "grey.50",
              borderRadius: 1,
            }}
          >
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Notizen:
            </Typography>
            <Typography variant="body2" whiteSpace="pre-wrap">
              {job.notes}
            </Typography>
          </Box>
        )}
      </CardContent>

      <Divider />

      <CardActions
        sx={{
          px: 3,
          py: 1.5,
          bgcolor: "grey.50",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <MuiButton
            variant="primary"
            size="sm"
            onClick={(e) => setStatusAnchorEl(e.currentTarget)}
            isLoading={false}
          >
            Status ändern
          </MuiButton>

          <Menu
            anchorEl={statusAnchorEl}
            open={statusMenuOpen}
            onClose={() => setStatusAnchorEl(null)}
          >
            {["Beworben", "Interview", "Abgelehnt", "Angenommen"].map(
              (status) => (
                <MenuItem
                  key={status}
                  onClick={() => handleStatusChange(status as any)}
                  selected={job.status === status}
                  dense
                >
                  {status}
                </MenuItem>
              )
            )}
          </Menu>
        </Box>

        <Box>
          <IconButton
            aria-label="Aktionen"
            aria-controls="job-menu"
            aria-haspopup="true"
            onClick={(e) => setMenuAnchorEl(e.currentTarget)}
            size="small"
          >
            <MoreVertIcon />
          </IconButton>

          <Menu
            id="job-menu"
            anchorEl={menuAnchorEl}
            open={actionsMenuOpen}
            onClose={() => setMenuAnchorEl(null)}
          >
            <MenuItem onClick={handleEdit}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Bearbeiten</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleDelete} disabled={isDeleting}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText
                primary={isDeleting ? "Wird gelöscht..." : "Löschen"}
              />
            </MenuItem>
          </Menu>
        </Box>
      </CardActions>
    </Card>
  );
}
