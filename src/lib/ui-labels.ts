/**
 * UI strings for the framework chrome (TOC, pagination, page actions, search).
 *
 * Nimbus 0.8 ships its component labels in English and has no UI-string
 * config, so the starter components take optional labels and the layouts pass
 * them in per locale. Components keep their English defaults, so nothing breaks
 * if a prop is omitted.
 */
import type { Locale } from "./i18n";

export interface ChromeLabels {
  tocTitle: string;
  tocAria: string;
  jumpToSection: string;
  overview: string;
  filterPlaceholder: string;
  filterAria: string;
  previous: string;
  next: string;
  breadcrumbAria: string;
  moreSegments: (n: number) => string;
  siteNavAria: string;
  navigation: string;
  closeSidebar: string;
  searchAria: string;
  searchPlaceholder: string;
  searchLabel: string;
  searchEmpty: string;
  searchSearching: string;
  searchNoResults: string;
  searchUnavailable: string;
  searchBuildHint: string;
  searchNavigate: string;
  searchSelect: string;
  searchCloseHint: string;
  published: string;
  updated: string;
  copyPage: string;
  copied: string;
  copyError: string;
  viewAsMarkdown: string;
  editPage: string;
  draft: string;
  forHumans: string;
  dateLocale: string;
}

const en: ChromeLabels = {
  tocTitle: "On this page",
  tocAria: "Table of contents",
  jumpToSection: "Jump to section",
  overview: "Overview",
  filterPlaceholder: "Filter…",
  filterAria: "Filter navigation",
  previous: "Previous",
  next: "Next",
  breadcrumbAria: "Breadcrumb",
  moreSegments: (n) => `Show ${n} more path segments`,
  siteNavAria: "Site navigation",
  navigation: "Navigation",
  closeSidebar: "Close sidebar",
  searchAria: "Search documentation",
  searchPlaceholder: "Search documentation…",
  searchLabel: "Search",
  searchEmpty: "Type to search…",
  searchSearching: "Searching…",
  searchNoResults: "No results found.",
  searchUnavailable: "Search is temporarily unavailable.",
  searchBuildHint: "Search is available after a production build.",
  searchNavigate: "↑↓ navigate",
  searchSelect: "↵ select",
  searchCloseHint: "Esc close",
  published: "Published",
  updated: "Updated",
  copyPage: "Copy page",
  copied: "Copied",
  copyError: "Couldn't copy",
  viewAsMarkdown: "View as Markdown",
  editPage: "Edit this page",
  draft: "Draft",
  forHumans: "For humans",
  dateLocale: "en-US",
};

const zh: ChromeLabels = {
  tocTitle: "本页目录",
  tocAria: "目录",
  jumpToSection: "跳转到章节",
  overview: "页面概览",
  filterPlaceholder: "筛选…",
  filterAria: "筛选导航",
  previous: "上一篇",
  next: "下一篇",
  breadcrumbAria: "面包屑导航",
  moreSegments: (n) => `显示另外 ${n} 级路径`,
  siteNavAria: "站点导航",
  navigation: "导航",
  closeSidebar: "关闭侧边栏",
  searchAria: "搜索文章",
  searchPlaceholder: "搜索文章…",
  searchLabel: "搜索",
  searchEmpty: "输入关键词开始搜索…",
  searchSearching: "搜索中…",
  searchNoResults: "没有找到相关结果。",
  searchUnavailable: "搜索暂时不可用。",
  searchBuildHint: "搜索功能在生产构建后可用。",
  searchNavigate: "↑↓ 选择",
  searchSelect: "↵ 打开",
  searchCloseHint: "Esc 关闭",
  published: "发布于",
  updated: "更新于",
  copyPage: "复制正文",
  copied: "已复制",
  copyError: "复制失败",
  viewAsMarkdown: "查看 Markdown",
  editPage: "编辑本文",
  draft: "草稿",
  forHumans: "写给人类",
  dateLocale: "zh-CN",
};

export function chrome(locale: Locale): ChromeLabels {
  return locale === "zh" ? zh : en;
}
