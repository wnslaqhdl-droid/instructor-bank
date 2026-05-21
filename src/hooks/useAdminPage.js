import {
  useState,
  useEffect,
  useMemo
} from "react";

import { supabase } from "../supabase";

import usePageSize
  from "./usePageSize";

import {
  getAdminInstructors,
  updateInstructorStatus,
  deleteInstructor,
  applyUpdateRequest
} from "../services/adminService";

import {
  getUpdateRequests
} from "../services/requestService";

export default function useAdminPage() {

  const [items, setItems] =
    useState([]);

  const [updateRequests,
    setUpdateRequests] =
    useState([]);

  const [message,
    setMessage] =
    useState("");

  const [adminKeyword,
    setAdminKeyword] =
    useState("");

  const [adminStatus,
    setAdminStatus] =
    useState("");

  const [requestStatusFilter,
    setRequestStatusFilter] =
    useState("");

  const [adminPage,
    setAdminPage] =
    useState(1);

  const [requestPage,
    setRequestPage] =
    useState(1);

  const [
    adminItemsPerPage,
    setAdminItemsPerPage
  ] = usePageSize(10);

  const [
    requestItemsPerPage,
    setRequestItemsPerPage
  ] = usePageSize(10);

  async function loadAdmin() {

    try {

      const data =
        await getAdminInstructors();

      setItems(data);

    } catch (err) {

      setMessage(err.message);

    }
  }

  async function loadRequests() {

    try {

      const data =
        await getUpdateRequests();

      setUpdateRequests(data);

    } catch (err) {

      setMessage(err.message);

    }
  }

  async function updateStatus(
    id,
    status
  ) {

    try {

      await updateInstructorStatus(
        id,
        status
      );

      window.alert(
        `${status} 처리 완료`
      );

      loadAdmin();

    } catch (err) {

      window.alert(err.message);

    }
  }

  async function deleteItem(id) {

    if (
      !window.confirm(
        "정말 삭제하시겠습니까?"
      )
    ) {
      return;
    }

    try {

      await deleteInstructor(id);

      window.alert("삭제 완료");

      loadAdmin();

    } catch (err) {

      window.alert(err.message);

    }
  }

  async function approveRequest(req) {

    if (
      !window.confirm(
        "수정 요청을 승인하시겠습니까?"
      )
    ) {
      return;
    }

    try {

      await applyUpdateRequest(req);

      window.alert(
        "수정 요청 반영 완료"
      );

      loadRequests();
      loadAdmin();

    } catch (err) {

      window.alert(err.message);

    }
  }

  async function rejectRequest(req) {

    const reason =
      window.prompt(
        "반려 사유를 입력하세요."
      );

    if (reason === null) {
      return;
    }

    const { error } =
      await supabase
        .from(
          "instructor_update_requests"
        )
        .update({
          request_status: "반려",
          admin_memo: reason,
          reviewed_at:
            new Date()
              .toISOString()
        })
        .eq("id", req.id);

    if (error) {

      window.alert(
        "반려 처리 실패: " +
        error.message
      );

      return;
    }

    window.alert(
      "수정 요청을 반려 처리했습니다."
    );

    loadRequests();
  }

  const filteredItems =
    useMemo(() => {

      return items.filter((item) => {

        const keywordText = [

          item.name,
          item.email,
          item.phone,
          item.region,
          item.main_topic,
          item.organization

        ].join(" ");

        return (

          (!adminKeyword ||

            keywordText.includes(
              adminKeyword
            )) &&

          (!adminStatus ||

            item.public_status ===
            adminStatus)

        );
      });

    }, [
      items,
      adminKeyword,
      adminStatus
    ]);

  const filteredUpdateRequests =
    useMemo(() => {

      return updateRequests.filter(
        (req) => {

          if (
            requestStatusFilter
          ) {

            return (
              req.request_status ===
              requestStatusFilter
            );
          }

          return (
            req.request_status !==
            "대체됨"
          );
        }
      );

    }, [
      updateRequests,
      requestStatusFilter
    ]);

  const adminTotalPages =
    Math.ceil(
      filteredItems.length /
      adminItemsPerPage
    );

  const requestTotalPages =
    Math.ceil(
      filteredUpdateRequests.length /
      requestItemsPerPage
    );

  useEffect(() => {

    if (
      adminPage >
      adminTotalPages &&
      adminTotalPages > 0
    ) {

      setAdminPage(
        adminTotalPages
      );
    }

  }, [
    adminPage,
    adminTotalPages
  ]);

  useEffect(() => {

    if (
      requestPage >
      requestTotalPages &&
      requestTotalPages > 0
    ) {

      setRequestPage(
        requestTotalPages
      );
    }

  }, [
    requestPage,
    requestTotalPages
  ]);

  const paginatedAdminItems =
    filteredItems.slice(

      (adminPage - 1)
      * adminItemsPerPage,

      adminPage
      * adminItemsPerPage
    );

  const paginatedRequests =
    filteredUpdateRequests.slice(

      (requestPage - 1)
      * requestItemsPerPage,

      requestPage
      * requestItemsPerPage
    );

  return {

    message,
    setMessage,

    loadAdmin,
    loadRequests,

    items,
    updateRequests,

    adminKeyword,
    setAdminKeyword,

    adminStatus,
    setAdminStatus,

    requestStatusFilter,
    setRequestStatusFilter,

    adminPage,
    setAdminPage,

    requestPage,
    setRequestPage,

    adminItemsPerPage,
    setAdminItemsPerPage,

    requestItemsPerPage,
    setRequestItemsPerPage,

    paginatedAdminItems,
    paginatedRequests,

    filteredItems,
    filteredUpdateRequests,

    adminTotalPages,
    requestTotalPages,

    updateStatus,
    deleteItem,

    approveRequest,
    rejectRequest
  };
}
