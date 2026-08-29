# RISOLVI V7 hardening policy

RISOLVI V7 keeps case-intelligence rendering event-driven and fail-closed for ambiguous or incomplete cases.

Regression checks protect readiness bounds, human-review escalation, shell/Worker contract, and the battery-aware visible-tab fallback. Pull-request validation is read-only; production shell synchronization is allowed only after the test and syntax gates pass on main.
