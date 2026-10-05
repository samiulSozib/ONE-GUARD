import { ApiResponse } from "@/app/types/api.types";

import {
  PatrolAssignmentListResponse,
  PatrolAssignmentSummary,
  PatrolVisit,
  PatrolVisitOverview,
  PatrolVisitParams,
} from "@/app/types/patrolVisit";

import api, { handleApiResponse } from "./api.service";

/* =========================================================
   Patrol Visit Service
   ========================================================= */

export const patrolVisitService = {
  /* =======================================================
     Overview
     ======================================================= */

  getOverview: () =>
    handleApiResponse(
      api.get<ApiResponse<PatrolVisitOverview>>(
        "/admin/patrol-visits/overview"
      )
    ),

  /* =======================================================
     Patrol Assignment List
     ======================================================= */

  getAll: (params: PatrolVisitParams = {}) =>
    handleApiResponse(
      api.get<ApiResponse<PatrolAssignmentListResponse>>(
        "/admin/patrol-visits",
        {
          params,
        }
      )
    ),

  /* =======================================================
     Visits By Assignment
     ======================================================= */

  getByAssignment: (
    assignmentId: number,
    params: PatrolVisitParams = {}
  ) =>
    handleApiResponse(
      api.get<ApiResponse<PatrolVisit[]>>(
        `/admin/patrol-visits/assignment/${assignmentId}`,
        {
          params,
        }
      )
    ),

  /* =======================================================
     Single Patrol Visit
     ======================================================= */

  getById: (id: number) =>
    handleApiResponse(
      api.get<ApiResponse<PatrolVisit>>(
        `/admin/patrol-visits/${id}`
      )
    ),

  /* =======================================================
     Build Assignment Summary
     ======================================================= */

  buildAssignmentSummary: (
    assignmentId: number,
    visits: PatrolVisit[]
  ): PatrolAssignmentSummary | null => {
    if (!visits.length) {
      return null;
    }

    const sortedVisits = [...visits].sort(
      (a, b) =>
        Number(a.visit_number ?? 0) -
        Number(b.visit_number ?? 0)
    );

    const firstVisit = sortedVisits[0];

    const completedVisits = sortedVisits.filter(
      (visit) => visit.status === "completed"
    ).length;

    const checkedInVisits = sortedVisits.filter(
      (visit) => visit.status === "checked_in"
    ).length;

    const missedVisits = sortedVisits.filter(
      (visit) => visit.status === "missed"
    ).length;

    const cancelledVisits = sortedVisits.filter(
      (visit) => visit.status === "cancelled"
    ).length;

    const requiredVisits = Math.max(
      Number(firstVisit?.duty?.required_visits ?? 0),
      sortedVisits.length
    );

    const remainingVisits = Math.max(
      requiredVisits - completedVisits,
      0
    );

    let status: PatrolAssignmentSummary["status"] = "pending";

    if (
      requiredVisits > 0 &&
      completedVisits >= requiredVisits
    ) {
      status = "completed";
    } else if (checkedInVisits > 0) {
      status = "in_progress";
    } else if (completedVisits > 0) {
      status = "partially_completed";
    } else if (missedVisits > 0) {
      status = "missed";
    } else if (
      cancelledVisits > 0 &&
      cancelledVisits === sortedVisits.length
    ) {
      status = "cancelled";
    }

    const latestVisit = [...sortedVisits].sort(
      (a, b) => {
        const aTime = new Date(
          a.checked_out_at ??
          a.checked_in_at ??
          a.updated_at ??
          a.created_at ??
          0
        ).getTime();

        const bTime = new Date(
          b.checked_out_at ??
          b.checked_in_at ??
          b.updated_at ??
          b.created_at ??
          0
        ).getTime();

        return bTime - aTime;
      }
    )[0];

    const progressPercentage =
      requiredVisits > 0
        ? Math.min(
          100,
          Math.round(
            (completedVisits / requiredVisits) * 100
          )
        )
        : 0;

    return {
      assignment_id: assignmentId,

      duty_id:
        firstVisit?.duty_id ??
        firstVisit?.duty?.id ??
        0,

      guard_id:
        firstVisit?.guard_id ??
        firstVisit?.guard?.id ??
        0,

      required_visits: requiredVisits,
      completed_visits: completedVisits,
      checked_in_visits: checkedInVisits,
      missed_visits: missedVisits,
      cancelled_visits: cancelledVisits,
      remaining_visits: remainingVisits,

      progress_percentage: progressPercentage,

      status,

      latest_visit: latestVisit ?? null,

      guard:
        firstVisit?.guard ??
        firstVisit?.guard_assignment?.guard ??
        null,

      duty:
        firstVisit?.duty ?? null,

      site:
        firstVisit?.duty?.site ??
        firstVisit?.guard_assignment?.duty?.site ??
        null,

      site_location:
        firstVisit?.duty?.site_location ??
        firstVisit?.guard_assignment?.duty?.site_location ??
        null,

      visits: sortedVisits,
    };
  },
};

export default patrolVisitService;