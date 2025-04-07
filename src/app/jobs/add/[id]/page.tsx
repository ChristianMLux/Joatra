"use client";

import AuthCheck from "@/components/auth/AuthCheck";
import JobForm from "@/components/jobs/JobForm";
import { useParams } from "next/navigation";

export default function EditJob() {
  const params = useParams();
  const id = params?.id as string;

  return <AuthCheck>{id && <JobForm jobId={id} />}</AuthCheck>;
}
