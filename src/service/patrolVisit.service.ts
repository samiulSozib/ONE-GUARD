import { ApiResponse } from "@/app/types/api.types";

import {
  PatrolAssignmentListResponse,
  PatrolAssignmentSummary,
  PatrolVisit,
  PatrolVisitOverview,
  PatrolVisitParams,
} from "@/app/types/patrolVisit";

import api from "@/lib/axios";

/* =========================================================
   Patrol Visit Service
   ========================================================= */

class PatrolVisitService {
  private readonly baseUrl = "/admin/patrol-visits";

  /* =======================================================
     Get Patrol Assignment List
     ======================================================= */

  async getAll(
    params?: PatrolVisitParams
  ): Promise<ApiResponse<PatrolAssignmentListResponse>> {
    const response = await api.get<
      ApiResponse<PatrolAssignmentListResponse>
    >(
      this.baseUrl,
      {
        params,
      }
    );

    return response.data;
  }

  /* =======================================================
     Get Patrol Overview
     ======================================================= */

  async getOverview(): Promise<
    ApiResponse<PatrolVisitOverview>
  > {
    const response = await api.get<
      ApiResponse<PatrolVisitOverview>
    >(
      `${this.baseUrl}/overview`
    );

    return response.data;
  }

  /* =======================================================
     Get Visits By Assignment
     ======================================================= */

  async getByAssignment(
    assignmentId: number,
    params?: PatrolVisitParams
  ): Promise<ApiResponse<PatrolVisit[]>> {
    const response = await api.get<
      ApiResponse<PatrolVisit[]>
    >(
      `${this.baseUrl}/assignment/${assignmentId}`,
      {
        params,
      }
    );

    return response.data;
  }

  /* =======================================================
     Get Individual Patrol Visit
     ======================================================= */

  async getById(
    id: number
  ): Promise<ApiResponse<PatrolVisit>> {
    const response = await api.get<
      ApiResponse<PatrolVisit>
    >(
      `${this.baseUrl}/${id}`
    );

    return response.data;
  }

  /* =======================================================
     Build Assignment Summary From Visits

     Useful when assignment endpoint returns visit records
     and the UI needs a single assignment-level object.
     ======================================================= */

  buildAssignmentSummary(
    assignmentId: number,
    visits: PatrolVisit[]
  ): PatrolAssignmentSummary {
    const firstVisit =
      visits.length > 0
        ? visits[0]
        : null;

    const completedVisits =
      visits.filter(
        (visit) =>
          visit.status === "completed"
      ).length;

    const checkedInVisits =
      visits.filter(
        (visit) =>
          visit.status === "checked_in"
      ).length;

    const missedVisits =
      visits.filter(
        (visit) =>
          visit.status === "missed"
      ).length;

    const cancelledVisits =
      visits.filter(
        (visit) =>
          visit.status === "cancelled"
      ).length;

    const requiredVisits =
      firstVisit?.duty?.required_visits ??
      visits.length;

    const remainingVisits = Math.max(
      requiredVisits - completedVisits,
      0
    );

    let status: string = "pending";

    if (
      requiredVisits > 0 &&
      completedVisits >= requiredVisits
    ) {
      status = "completed";
    } else if (
      checkedInVisits > 0 ||
      completedVisits > 0
    ) {
      status = "in_progress";
    } else if (
      missedVisits > 0 &&
      completedVisits === 0
    ) {
      status = "missed";
    }

    const progressPercentage =
      requiredVisits > 0
        ? Math.min(
            Math.round(
              (completedVisits /
                requiredVisits) *
                100
            ),
            100
          )
        : 0;

    const latestVisit =
      visits.length > 0
        ? [...visits].sort(
            (a, b) =>
              (b.visit_number ?? 0) -
              (a.visit_number ?? 0)
          )[0]
        : null;

    return {
      assignment_id: assignmentId,

      duty_id:
        firstVisit?.duty_id ??
        firstVisit?.duty?.id ??
        null,

      guard_id:
        firstVisit?.guard_id ??
        firstVisit?.guard?.id ??
        null,

      duty_date:
        firstVisit?.duty?.duty_date ??
        null,

      status,

      required_visits: requiredVisits,

      completed_visits:
        completedVisits,

      remaining_visits:
        remainingVisits,

      checked_in_visits:
        checkedInVisits,

      missed_visits:
        missedVisits,

      cancelled_visits:
        cancelledVisits,

      progress_percentage:
        progressPercentage,

      latest_visit:
        latestVisit,

      guard:
        firstVisit?.guard ??
        firstVisit?.guard_assignment
          ?.guard ??
        null,

      duty:
        firstVisit?.duty ??
        firstVisit?.guard_assignment
          ?.duty ??
        null,

      site:
        firstVisit?.duty?.site ??
        firstVisit?.guard_assignment
          ?.duty?.site ??
        null,

      site_location:
        firstVisit?.duty
          ?.site_location ??
        firstVisit?.guard_assignment
          ?.duty?.site_location ??
        null,

      visits,
    };
  }
}

/* =========================================================
   Export
   ========================================================= */

const patrolVisitService =
  new PatrolVisitService();

export default patrolVisitService;
