import { ApiResponse } from "@/app/types/api.types";

import {
  PatrolAssignmentDetailsResponse,
  PatrolAssignmentListResponse,
  PatrolAssignmentSummary,
  PatrolVisit,
  PatrolVisitOverview,
  PatrolVisitParams,
} from "@/app/types/patrolVisit";

import api, { handleApiResponse } from "./api.service";

/* =========================================================
   API Item Wrappers
   ========================================================= */

interface PatrolOverviewApiBody {
  item: PatrolVisitOverview;
}

interface PatrolAssignmentDetailsApiBody {
  item: PatrolAssignmentDetailsResponse;
}

interface PatrolVisitApiBody {
  item: PatrolVisit;
}

/* =========================================================
   Helpers
   ========================================================= */

const normalizeAssignment = (
  assignment: PatrolAssignmentSummary
): PatrolAssignmentSummary => {
  const guard = assignment.guard
    ? {
      ...assignment.guard,

      full_name:
        assignment.guard.full_name ??
        assignment.guard.name ??
        null,
    }
    : null;

  const duty = assignment.duty ?? null;

  return {
    ...assignment,

    guard,

    duty_id:
      assignment.duty_id ??
      duty?.id ??
      null,

    guard_id:
      assignment.guard_id ??
      guard?.id ??
      null,

    duty_date:
      assignment.duty_date ??
      duty?.duty_date ??
      null,

    status:
      assignment.operational_status ??
      assignment.status ??
      assignment.assignment_status ??
      "not_started",

    latest_visit:
      assignment.latest_visit ?? null,

    visits:
      assignment.visits ?? [],
  };
};

/* =========================================================
   Patrol Visit Service
   ========================================================= */

export const patrolVisitService = {
  /* =======================================================
     Overview
     ======================================================= */

  getOverview: async (): Promise<PatrolVisitOverview> => {
    const response =
      await handleApiResponse(
        api.get<ApiResponse<PatrolOverviewApiBody>>(
          "/admin/patrol-visits/overview"
        )
      );

    return response.item;
  },

  /* =======================================================
     Patrol Assignment List
     ======================================================= */

  getAll: async (
    params: PatrolVisitParams = {}
  ): Promise<PatrolAssignmentListResponse> => {
    const response =
      await handleApiResponse(
        api.get<
          ApiResponse<PatrolAssignmentListResponse>
        >("/admin/patrol-visits", {
          params,
        })
      );

    return {
      ...response,

      items: (response.items ?? []).map(
        normalizeAssignment
      ),
    };
  },

  /* =======================================================
     Visits By Assignment
     ======================================================= */

  getByAssignment: async (
    assignmentId: number,
    params: PatrolVisitParams = {}
  ): Promise<PatrolAssignmentDetailsResponse> => {
    const response =
      await handleApiResponse(
        api.get<
          ApiResponse<PatrolAssignmentDetailsApiBody>
        >(
          `/admin/patrol-visits/assignment/${assignmentId}`,
          {
            params,
          }
        )
      );

    const item = response.item;

    const assignment =
      normalizeAssignment({
        ...item.assignment,

        required_visits:
          item.required_visits ??
          item.assignment.required_visits ??
          0,

        completed_visits:
          item.completed_visits ??
          item.assignment.completed_visits ??
          0,

        remaining_visits:
          item.remaining_visits ??
          item.assignment.remaining_visits ??
          0,

        progress_percentage:
          item.progress_percentage ??
          item.assignment.progress_percentage ??
          0,

        visits:
          item.visits ?? [],
      });

    return {
      ...item,

      assignment,

      visits: item.visits ?? [],
    };
  },

  /* =======================================================
     Single Patrol Visit
     ======================================================= */

  getById: async (
    id: number
  ): Promise<PatrolVisit> => {
    const response =
      await handleApiResponse(
        api.get<ApiResponse<PatrolVisitApiBody>>(
          `/admin/patrol-visits/${id}`
        )
      );

    return response.item;
  },

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

    const completedVisits =
      sortedVisits.filter(
        (visit) =>
          visit.status === "completed"
      ).length;

    const checkedInVisits =
      sortedVisits.filter(
        (visit) =>
          visit.status === "checked_in"
      ).length;

    const missedVisits =
      sortedVisits.filter(
        (visit) =>
          visit.status === "missed"
      ).length;

    const cancelledVisits =
      sortedVisits.filter(
        (visit) =>
          visit.status === "cancelled"
      ).length;

    const requiredVisits = Math.max(
      Number(
        firstVisit?.duty?.required_visits ??
        0
      ),
      sortedVisits.length
    );

    const remainingVisits = Math.max(
      requiredVisits - completedVisits,
      0
    );

    let status: PatrolAssignmentSummary["status"] =
      "pending";

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
      cancelledVisits ===
      sortedVisits.length
    ) {
      status = "cancelled";
    }

    const latestVisit =
      [...sortedVisits].sort(
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
            (completedVisits /
              requiredVisits) *
            100
          )
        )
        : 0;

    return normalizeAssignment({
      assignment_id: assignmentId,

      duty_id:
        firstVisit?.duty_id ??
        firstVisit?.duty?.id ??
        0,

      guard_id:
        firstVisit?.guard_id ??
        firstVisit?.guard?.id ??
        0,

      required_visits:
        requiredVisits,

      completed_visits:
        completedVisits,

      checked_in_visits:
        checkedInVisits,

      missed_visits:
        missedVisits,

      cancelled_visits:
        cancelledVisits,

      remaining_visits:
        remainingVisits,

      progress_percentage:
        progressPercentage,

      status,

      latest_visit:
        latestVisit ?? null,

      guard:
        firstVisit?.guard ??
        firstVisit
          ?.guard_assignment
          ?.guard ??
        null,

      duty:
        firstVisit?.duty ??
        null,

      site:
        firstVisit?.duty?.site ??
        firstVisit
          ?.guard_assignment
          ?.duty?.site ??
        null,

      site_location:
        firstVisit?.duty
          ?.site_location ??
        firstVisit
          ?.guard_assignment
          ?.duty?.site_location ??
        null,

      visits: sortedVisits,
    });
  },
};

export default patrolVisitService;