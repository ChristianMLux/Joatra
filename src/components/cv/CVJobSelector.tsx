"use client";

import { Job } from "@/lib/types";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardActionArea,
  Typography,
  Chip,
} from "@mui/material";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface CVJobSelectorProps {
  jobs: Job[];
  selectedJobId?: string;
  onSelect: (job: Job) => void;
}

export default function CVJobSelector({
  jobs,
  selectedJobId,
  onSelect,
}: CVJobSelectorProps) {
  const formatDate = (date: any): string => {
    if (!date) return "";

    let dateObj: Date;

    if (typeof date === "object" && "toDate" in date) {
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      dateObj = new Date(date);
    }

    if (isNaN(dateObj.getTime())) {
      return "";
    }

    return format(dateObj, "dd. MMMM yyyy", { locale: de });
  };

  if (jobs.length === 0) {
    return (
      <Box className="p-8 text-center border rounded-lg bg-gray-50">
        <Typography variant="body1" color="textSecondary">
          Du hast noch keine Stellen hinzugefügt. Füge zuerst eine Stelle hinzu,
          um einen Lebenslauf zu generieren.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {jobs.map((job) => (
        <Grid key={job.id}>
          <Card
            elevation={0}
            className={`border ${selectedJobId === job.id ? "border-blue-500" : "border-gray-200"} rounded-lg transition-all h-full`}
            sx={{
              boxShadow:
                selectedJobId === job.id
                  ? "0 0 0 2px rgba(59, 130, 246, 0.5)"
                  : "none",
              "&:hover": {
                borderColor:
                  selectedJobId === job.id
                    ? "rgb(59, 130, 246)"
                    : "rgb(209, 213, 219)",
              },
            }}
          >
            <CardActionArea onClick={() => onSelect(job)} className="h-full">
              <CardContent className="p-5 flex flex-col h-full">
                <Box className="mb-2 flex items-start justify-between">
                  <Typography
                    variant="h6"
                    component="h3"
                    noWrap
                    title={job.jobTitle}
                  >
                    {job.jobTitle}
                  </Typography>
                  <Chip
                    label={job.status}
                    size="small"
                    color={
                      job.status === "Beworben"
                        ? "warning"
                        : job.status === "Interview"
                          ? "info"
                          : job.status === "Abgelehnt"
                            ? "error"
                            : job.status === "Angenommen"
                              ? "success"
                              : "default"
                    }
                  />
                </Box>

                <Typography
                  variant="body2"
                  color="textSecondary"
                  gutterBottom
                  noWrap
                >
                  {job.company} {job.location && `• ${job.location}`}
                </Typography>

                <Typography
                  variant="caption"
                  color="textSecondary"
                  gutterBottom
                  className="mt-2"
                >
                  Bewerbung: {formatDate(job.applicationDate)}
                </Typography>

                {job.techStack && job.techStack.length > 0 && (
                  <Box className="mt-auto pt-3">
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      component="div"
                      className="mb-1"
                    >
                      Tech Stack:
                    </Typography>
                    <Box className="flex flex-wrap gap-1">
                      {job.techStack.slice(0, 3).map((tech, i) => (
                        <Chip
                          key={i}
                          label={tech}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                      {job.techStack.length > 3 && (
                        <Chip
                          label={`+${job.techStack.length - 3}`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
