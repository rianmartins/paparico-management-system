'use client';

import type { HTMLAttributes, KeyboardEvent, ReactNode } from 'react';
import { useId, useState } from 'react';
import { isValidElement } from 'react';
import cx from 'classnames';

import SidebarTab from './SidebarTab';
import styles from './Sidebar.module.css';

export type SidebarTabItem = {
  id: string;
  label: ReactNode;
  icon: ReactNode;
  tooltip?: string;
  disabled?: boolean;
  tabId?: string;
  panelId?: string;
};

type SidebarTabEntry = {
  buttonId: string;
  tab: SidebarTabItem;
};

export type SidebarProps = Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> & {
  tabs: readonly SidebarTabItem[];
  selectedTabId: string;
  onTabSelect: (tabId: string) => void;
  ariaLabel?: string;
  defaultCollapsed?: boolean;
  isCollapsed?: boolean;
  onCollapsedChange?: (isCollapsed: boolean) => void;
  expandButtonLabel?: string;
};

function getTextFromNode(node: ReactNode): string | undefined {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }

  if (Array.isArray(node)) {
    const text = node.map(getTextFromNode).filter(Boolean).join('');

    return text || undefined;
  }

  if (isValidElement<{ children?: ReactNode }>(node)) {
    return getTextFromNode(node.props.children);
  }

  return undefined;
}

function getNextEnabledEntry(
  entries: readonly SidebarTabEntry[],
  selectedTabId: string,
  key: KeyboardEvent<HTMLDivElement>['key']
) {
  const enabledEntries = entries.filter(({ tab }) => !tab.disabled);

  if (!enabledEntries.length) {
    return null;
  }

  if (key === 'Home') {
    return enabledEntries[0];
  }

  if (key === 'End') {
    return enabledEntries[enabledEntries.length - 1];
  }

  const selectedIndex = enabledEntries.findIndex(({ tab }) => tab.id === selectedTabId);
  const currentIndex = selectedIndex >= 0 ? selectedIndex : 0;

  if (key === 'ArrowDown' || key === 'ArrowRight') {
    return enabledEntries[(currentIndex + 1) % enabledEntries.length];
  }

  if (key === 'ArrowUp' || key === 'ArrowLeft') {
    return enabledEntries[(currentIndex - 1 + enabledEntries.length) % enabledEntries.length];
  }

  return null;
}

export default function Sidebar({
  ariaLabel = 'Sidebar tabs',
  className = '',
  defaultCollapsed = false,
  expandButtonLabel = 'Expand sidebar',
  isCollapsed,
  onCollapsedChange,
  onTabSelect,
  selectedTabId,
  tabs,
  ...props
}: SidebarProps) {
  const sidebarId = useId();
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const resolvedIsCollapsed = isCollapsed ?? internalCollapsed;
  const tabListId = `${sidebarId}-tab-list`;
  const tabEntries = tabs.map((tab, index) => ({
    buttonId: tab.tabId ?? `${sidebarId}-tab-${index}`,
    tab
  }));

  function setCollapsed(nextIsCollapsed: boolean) {
    if (isCollapsed === undefined) {
      setInternalCollapsed(nextIsCollapsed);
    }

    onCollapsedChange?.(nextIsCollapsed);
  }

  function handleCollapsedChange() {
    setCollapsed(!resolvedIsCollapsed);
  }

  function handleTabClick(tab: SidebarTabItem) {
    if (tab.id === selectedTabId) {
      handleCollapsedChange();
      return;
    }

    onTabSelect(tab.id);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const nextEntry = getNextEnabledEntry(tabEntries, selectedTabId, event.key);

    if (!nextEntry) {
      return;
    }

    event.preventDefault();
    onTabSelect(nextEntry.tab.id);
    document.getElementById(nextEntry.buttonId)?.focus();
  }

  return (
    <div {...props} className={cx(styles.Sidebar, { [styles.collapsed]: resolvedIsCollapsed }, className)}>
      <div
        aria-label={ariaLabel}
        aria-orientation="vertical"
        className={styles.tabList}
        id={tabListId}
        onKeyDown={handleKeyDown}
        role="tablist"
      >
        {tabEntries.map(({ buttonId, tab }) => (
          <SidebarTab
            disabled={tab.disabled}
            icon={tab.icon}
            id={buttonId}
            isSelected={tab.id === selectedTabId}
            key={tab.id}
            label={tab.label}
            onClick={() => handleTabClick(tab)}
            panelId={tab.panelId}
            tooltip={resolvedIsCollapsed ? (tab.tooltip ?? getTextFromNode(tab.label)) : tab.tooltip}
          />
        ))}
      </div>

      {resolvedIsCollapsed ? (
        <button
          aria-controls={tabListId}
          aria-expanded={false}
          aria-label={expandButtonLabel}
          className={styles.toggleButton}
          onClick={handleCollapsedChange}
          type="button"
        >
          <span aria-hidden="true">{'>'}</span>
        </button>
      ) : null}
    </div>
  );
}
