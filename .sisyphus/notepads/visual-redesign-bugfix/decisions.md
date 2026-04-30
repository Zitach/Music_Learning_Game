# Decisions

## [2026-04-29] Visual Direction
- Bright game style (类 Simply Piano) — white bg + #6B4EE6 purple primary
- Dark theme preserved as toggle option, updated to purple dark variant
- Fonts: Poppins (headings/body) + Quicksand (friendly elements)
- No new UI component abstractions — CSS restyling only

## [2026-04-29] Bug Fix Strategy
- Bug fixes strictly separated from visual changes (Wave 1 = zero visual)
- Error Boundary added as safety net
- AssessView return null → loading state fallback
- useQuestionSession useEffect dependency stabilized
- AppRouter null → auto-redirect to map
