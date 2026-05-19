import {
  useState,
  useEffect,
  useMemo
} from "react";

import usePageSize
  from "./usePageSize";

import { filterAndSortInstructors } from "../utils/searchFilters";

export default function useSearchPage({
  searchInstructors
}) {

  const [items, setItems] =
    useState([]);

  const [keyword, setKeyword] =
    useState("");

  const [debouncedKeyword,
    setDebouncedKeyword] =
    useState("");

  const [region, setRegion] =
    useState("");

  const [target, setTarget] =
    useState("");

  const [type, setType] =
    useState("");

  const [specialty,
    setSpecialty] =
    useState("");

  const [message,
    setMessage] =
    useState("");

  const [openId,
    setOpenId] =
    useState(null);

  const [openBadgeId,
    setOpenBadgeId] =
    useState(null);

  const [sortType,
    setSortType] =
    useState("latest");

  const [onlyVerified,
    setOnlyVerified] =
    useState(false);

  const [currentPage,
    setCurrentPage] =
    useState(1);

  const [loading,
    setLoading] =
    useState(true);

  const [
    itemsPerPage,
    setItemsPerPage
  ] = usePageSize(5);

  async function load() {

    setLoading(true);

    try {

      const data =
        await searchInstructors();

      setItems(data);

    } catch (err) {

      setMessage(err.message);

    } finally {

      setLoading(false);

    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {

    const timer =
      setTimeout(() => {

        setDebouncedKeyword(
          keyword
        );

      }, 300);

    return () =>
      clearTimeout(timer);

  }, [keyword]);

  useEffect(() => {

    setCurrentPage(1);

  }, [
    debouncedKeyword,
    region,
    target,
    type,
    specialty,
    onlyVerified,
    sortType
  ]);

  function toggleDetail(id) {

    setOpenId((prev) =>
      prev === id
        ? null
        : id
    );
  }

  const normalizedKeyword =
    debouncedKeyword
      .trim()
      .toLowerCase();

  const filtered =
    useMemo(() => {

      return filterAndSortInstructors({
        items,
        normalizedKeyword,
        region,
        target,
        type,
        specialty,
        sortType,
        onlyVerified
      });

    }, [
      items,
      normalizedKeyword,
      region,
      target,
      type,
      specialty,
      sortType,
      onlyVerified
    ]);

  const totalPages =
    Math.ceil(
      filtered.length /
      itemsPerPage
    );

  const paginatedItems =
    filtered.slice(
      (currentPage - 1)
        * itemsPerPage,

      currentPage
        * itemsPerPage
    );

  return {

    keyword,
    setKeyword,

    region,
    setRegion,

    target,
    setTarget,

    type,
    setType,

    specialty,
    setSpecialty,

    message,

    openId,
    openBadgeId,
    setOpenBadgeId,

    sortType,
    setSortType,

    onlyVerified,
    setOnlyVerified,

    currentPage,
    setCurrentPage,

    loading,

    filtered,
    paginatedItems,
    totalPages,

    toggleDetail,
    
    itemsPerPage,
    setItemsPerPage
  };
}
