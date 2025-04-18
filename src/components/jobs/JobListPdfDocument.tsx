import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import { Job } from "@/lib/types";

const STATUS_COLORS = {
  Beworben: { background: "#FFF9C4", text: "#795548" },
  Interview: { background: "#BBDEFB", text: "#0D47A1" },
  Angenommen: { background: "#C8E6C9", text: "#1B5E20" },
  Abgelehnt: { background: "#FFCDD2", text: "#B71C1C" },
  Default: { background: "#F5F5F5", text: "#424242" },
};

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: "15mm",
    fontSize: 9,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1.5,
    borderBottomColor: "#3b82f6",
  },
  title: {
    fontSize: 16,
    marginBottom: 5,
    color: "#1e3a8a",
    fontFamily: "Helvetica-Bold",
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    fontSize: 9,
    color: "#333333",
  },
  table: {
    width: "auto",
    borderStyle: "solid",
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
    borderBottomColor: "#cccccc",
    borderBottomWidth: 0.5,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    minHeight: 15,
    alignItems: "center",
  },
  tableHeader: {
    backgroundColor: "#3b82f6",
    color: "#FFFFFF",
    fontFamily: "Helvetica-Bold",
    minHeight: 18,
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#cccccc",
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
  },
  tableColHeader: {
    padding: 3,
    textAlign: "left",
    color: "#FFFFFF",
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
  },
  tableCol: {
    padding: 3,
    textAlign: "left",
    fontSize: 8.5,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
  },
  colFirma: { width: "25%" },
  colPosition: { width: "30%" },
  colStatus: { width: "15%", textAlign: "center", borderRadius: 3 },
  colKontakt: { width: "15%" },
  colOrt: { width: "15%" },

  footer: {
    position: "absolute",
    bottom: 10,
    left: "15mm",
    right: "15mm",
    fontSize: 8,
    color: "grey",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pageNumber: {},
});

const countStatusOccurrences = (jobs: Job[]) => {
  const counts: Record<string, number> = {};
  jobs.forEach((job) => {
    counts[job.status] = (counts[job.status] || 0) + 1;
  });
  return counts;
};

interface JobListPdfDocumentProps {
  jobs: Job[];
  userName?: string;
}

const JobListPdfDocument: React.FC<JobListPdfDocumentProps> = ({
  jobs,
  userName = "Nutzer",
}) => {
  const statusCounts = countStatusOccurrences(jobs);
  const totalJobs = jobs.length;

  return (
    <Document title={`Bewerbungen_${userName}`} author="Joatra">
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Übersicht über Bewerbungen von {userName}
          </Text>
          <View style={styles.summaryContainer}>
            <Text>Gesamtzahl: {totalJobs}</Text>
            {Object.entries(statusCounts).map(([status, count]) => (
              <Text key={status}>
                {status}: {count}
              </Text>
            ))}
          </View>
        </View>

        {/* Table Section */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]} fixed>
            <View style={[styles.tableColHeader, styles.colFirma]}>
              <Text>Firma</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colPosition]}>
              <Text>Position</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colStatus]}>
              <Text>Status</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colKontakt]}>
              <Text>Kontakt</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colOrt]}>
              <Text>Ort</Text>
            </View>
          </View>

          {/* Table Body */}
          {jobs.map((job, index) => {
            const statusStyle =
              STATUS_COLORS[job.status] || STATUS_COLORS.Default;
            return (
              <View key={job.id || index} style={styles.tableRow} wrap={false}>
                <View style={[styles.tableCol, styles.colFirma]}>
                  <Text>{job.company || "-"}</Text>
                </View>
                <View style={[styles.tableCol, styles.colPosition]}>
                  <Text>{job.jobTitle || "-"}</Text>
                </View>
                {/* Apply dynamic background and text color to status cell */}
                <View
                  style={[
                    styles.tableCol,
                    styles.colStatus,
                    { backgroundColor: statusStyle.background },
                  ]}
                >
                  <Text style={{ color: statusStyle.text }}>
                    {job.status || "-"}
                  </Text>
                </View>
                <View style={[styles.tableCol, styles.colKontakt]}>
                  <Text>{job.contactPerson?.name || "-"}</Text>
                </View>
                <View style={[styles.tableCol, styles.colOrt]}>
                  <Text>{job.location || "-"}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Footer Section */}
        <View style={styles.footer} fixed>
          <Text>Joatra - Job Application Tracker</Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) =>
              `${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
};

export default JobListPdfDocument;
