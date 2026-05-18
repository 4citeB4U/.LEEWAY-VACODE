---
name: skill.leeway.react-component.create
description: Create React components that comply with LeeWay standards for identity, traceability, owner help, and audit-safe mutation.
---

# LeeWay React Component Create

## Purpose
Generate React components with built-in LeeWay governance metadata and owner-safe behavior.

## Must enforce
- LeeWay header in the file
- stable component ID
- `data-leeway-id` on root and relevant nodes
- screen ID for any owner-facing view
- action IDs for buttons and interactive controls
- schema path metadata for inputs
- asset IDs plus validated alt text for images
- help trigger when the component is owner-facing
- audit category for mutation operations
- no anonymous runtime nodes or uncontrolled click handlers

## Output artifact
- component file with governance metadata
- associated registry entries if new screen/action IDs are introduced

## Validation commands
- Run component linting and JSX compilation
- Verify exported IDs and metadata exist
- Confirm no frontend secret-like strings are present in generated assets

## Audit category
- `ui.component.create`
