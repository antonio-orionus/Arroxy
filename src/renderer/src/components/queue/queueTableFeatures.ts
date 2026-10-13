// TanStack Table features for the Downloads tab table: user-sortable columns,
// persisted column order, and the column-visibility popover.
//
// `sortFn: 'auto'` only resolves comparators registered here. Text columns
// auto-pick `alphanumeric` (any digit in the value) or `text`; numeric columns
// fall back to the built-in basic comparator without registration.

import {columnOrderingFeature, columnVisibilityFeature, createSortedRowModel, rowSortingFeature, sortFn_alphanumeric, sortFn_text, tableFeatures} from '@tanstack/react-table'

export const queueTableFeatures = tableFeatures({columnOrderingFeature, columnVisibilityFeature, rowSortingFeature, sortedRowModel: createSortedRowModel(), sortFns: {alphanumeric: sortFn_alphanumeric, text: sortFn_text}})

export type QueueTableFeatures = typeof queueTableFeatures
