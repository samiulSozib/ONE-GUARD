"use client";

import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  CircleAlert,
  Footprints,
  RefreshCw,
} from "lucide-react";

import {
  PatrolAssignmentSummary,
} from "@/app/types/patrolVisit";

import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";

import {
  clearCurrentPatrolAssignment,
  fetchPatrolAssignments,
  fetchPatrolVisitOverview,
  fetchPatrolVisitsByAssignment,
  setCurrentPatrolAssignment,
} from "@/store/slices/patrolVisitSlice";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import PatrolVisitsOverview from "@/components/patrol-visits/patrol-visits-overview";
import PatrolVisitsTable from "@/components/patrol-visits/patrol-visits-table";
import PatrolVisitDetails from "@/components/patrol-visits/patrol-visit-details";

/* =========================================================
   View
   ========================================================= */

type PatrolManagementView =
  | "list"
  | "details";

/* =========================================================
   Patrol Visits Management
   ========================================================= */

const PatrolVisitsManagement = () => {
  const dispatch = useAppDispatch();

  const {
    overview,
    currentAssignment,
    visits,
    isLoading,
    isOverviewLoading,
    isDetailsLoading,
    error,
  } = useAppSelector(
    (state) => state.patrolVisits
  );

  const [
    activeView,
    setActiveView,
  ] =
    useState<PatrolManagementView>(
      "list"
    );

  /* =======================================================
     Initial Load
     ======================================================= */

  const loadOverview =
    useCallback(async () => {
      await dispatch(
        fetchPatrolVisitOverview()
      );
    }, [dispatch]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  /* =======================================================
     Refresh
     ======================================================= */

  const handleRefresh =
    async () => {
      if (
        activeView ===
          "details" &&
        currentAssignment
      ) {
        await Promise.all([
          dispatch(
            fetchPatrolVisitOverview()
          ),

          dispatch(
            fetchPatrolVisitsByAssignment(
              {
                assignmentId:
                  currentAssignment
                    .assignment_id,
              }
            )
          ),
        ]);

        return;
      }

      await Promise.all([
        dispatch(
          fetchPatrolVisitOverview()
        ),

        dispatch(
          fetchPatrolAssignments({
            page: 1,
            per_page: 10,
          })
        ),
      ]);
    };

  /* =======================================================
     Open Details
     ======================================================= */

  const handleViewAssignment = (
    assignment: PatrolAssignmentSummary
  ) => {
    dispatch(
      setCurrentPatrolAssignment(
        assignment
      )
    );

    setActiveView("details");
  };

  /* =======================================================
     Back To List
     ======================================================= */

  const handleBackToList = () => {
    dispatch(
      clearCurrentPatrolAssignment()
    );

    setActiveView("list");

    void dispatch(
      fetchPatrolVisitOverview()
    );
  };

  /* =======================================================
     Loading State
     ======================================================= */

  const refreshing =
    isLoading ||
    isOverviewLoading ||
    isDetailsLoading;

  return (
    <div className="flex flex-col gap-4">
      {/* ===================================================
          Error
          =================================================== */}

      {error && (
        <Card className="border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20">
          <div className="flex items-start gap-3">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />

            <div className="min-w-0">
              <p className="font-medium text-red-700 dark:text-red-400">
                Unable to load patrol
                data
              </p>

              <p className="mt-1 break-words text-sm text-red-600/90 dark:text-red-400/80">
                {error}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* ===================================================
          Header / Navigation
          =================================================== */}

      <Card className="p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            {activeView ===
            "details" ? (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={
                  handleBackToList
                }
                className="shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#5F0015]/10 text-[#5F0015]">
                <Footprints className="h-5 w-5" />
              </div>
            )}

            <div>
              <h1 className="text-lg font-semibold">
                {activeView ===
                "details"
                  ? "Patrol Details"
                  : "Patrol Visits"}
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                {activeView ===
                "details"
                  ? "Review individual patrol visits, check-in and check-out activity, duration and location information."
                  : "Monitor patrol execution, visit progress and completion across active guard assignments."}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={refreshing}
            onClick={() =>
              void handleRefresh()
            }
            className="w-full lg:w-auto"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh
          </Button>
        </div>
      </Card>

      {/* ===================================================
          List View
          =================================================== */}

      {activeView === "list" && (
        <>
          <PatrolVisitsOverview
            overview={overview}
            isLoading={
              isOverviewLoading
            }
          />

          <PatrolVisitsTable
            onViewAssignment={
              handleViewAssignment
            }
          />
        </>
      )}

      {/* ===================================================
          Details View
          =================================================== */}

      {activeView ===
        "details" && (
        <PatrolVisitDetails
          assignment={
            currentAssignment
          }
          visits={visits}
          isLoading={
            isDetailsLoading
          }
        />
      )}
    </div>
  );
};

export default PatrolVisitsManagement;

