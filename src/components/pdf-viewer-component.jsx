// src/components/pdf-viewer-component.jsx - Fixed with correct Nutrient event names
import { useEffect, useRef, useState } from "react";
import mixpanelService from "../services/mixpanel.js";

export default function PdfViewerComponent({
  document,
  fileName,
  onViewerReady,
}) {
  const containerRef = useRef(null);
  const [viewerInstance, setViewerInstance] = useState(null);
  const [documentInfo, setDocumentInfo] = useState(null);
  const startTimeRef = useRef(Date.now());
  const sessionId = useRef(
    `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );

  useEffect(() => {
    const container = containerRef.current;
    const { NutrientViewer } = window;

    if (container && NutrientViewer) {
      const loadStartTime = Date.now();

      NutrientViewer.load({
        licenseKey: import.meta.env.VITE_lkey,
        container,
        document: document,
        toolbarItems: [
          ...NutrientViewer.defaultToolbarItems,
          { type: "content-editor" },
        ],
      })
        .then(async (instance) => {
          const loadTime = Date.now() - loadStartTime;

          setViewerInstance(instance);

          // Get document information using Nutrient SDK
          const docInfo = await getDocumentInfoFromNutrient(instance);
          setDocumentInfo(docInfo);

          onViewerReady?.();

          // Track successful load
          mixpanelService.track("PDF Viewer Loaded", {
            load_time_ms: loadTime,
            file_name: fileName,
            session_id: sessionId.current,
            ...docInfo,
          });

          // Set up ONLY Nutrient SDK event listeners with correct event names
          setupNutrientSDKEvents(instance, docInfo);
        })
        .catch((error) => {
          console.error("PDF Viewer Load Error:", error);
          mixpanelService.track("PDF Viewer Load Error", {
            error_message: error.message,
            file_name: fileName,
            session_id: sessionId.current,
          });
        });
    }

    return () => {
      if (viewerInstance) {
        const sessionDuration = (Date.now() - startTimeRef.current) / 1000;
        mixpanelService.track("PDF Session End", {
          session_duration_seconds: sessionDuration,
          file_name: fileName,
          session_id: sessionId.current,
          ...documentInfo,
        });
      }
      NutrientViewer?.unload(container);
    };
  }, [document]);

  const getDocumentInfoFromNutrient = async (instance) => {
    try {
      const info = {
        file_name: fileName,
        session_id: sessionId.current,
      };

      // Get document properties using Nutrient SDK
      if (instance.totalPageCount !== undefined) {
        info.total_pages = instance.totalPageCount;
      }

      if (instance.viewState) {
        if (instance.viewState.currentPageIndex !== undefined) {
          info.initial_page = instance.viewState.currentPageIndex + 1;
        }
        if (
          instance.viewState.zoom !== undefined &&
          !isNaN(instance.viewState.zoom)
        ) {
          info.initial_zoom = Math.round(instance.viewState.zoom * 100);
        }
      }

      // Try to get initial annotations (with proper error handling)
      try {
        const annotations = await instance.getAnnotations(0); // Get annotations for first page
        info.initial_annotation_count = annotations.length;
      } catch (e) {
        console.log("Could not get initial annotations:", e.message);
        info.initial_annotation_count = 0;
      }

      console.log("📄 Document Info from Nutrient SDK:", info);
      return info;
    } catch (error) {
      console.error("Error getting document info:", error);
      return {
        file_name: fileName,
        session_id: sessionId.current,
        total_pages: "unknown",
      };
    }
  };

  const setupNutrientSDKEvents = (instance, docInfo) => {
    console.log(
      "🎯 Setting up Nutrient SDK event listeners with correct event names..."
    );

    const baseEventData = {
      session_id: sessionId.current,
      ...docInfo,
    };

    try {
      // ===========================================
      // CORRECT NUTRIENT SDK EVENTS (from error message)
      // ===========================================

      // 1. VIEW STATE CHANGES

      // Page Navigation - CORRECT EVENT NAME
      instance.addEventListener(
        "viewState.currentPageIndex.change",
        (pageIndex) => {
          console.log("📄 Page changed to:", pageIndex + 1);
          mixpanelService.track("Page Navigation", {
            ...baseEventData,
            page_number: pageIndex + 1,
            event_source: "nutrient_sdk",
          });
        }
      );

      // Zoom Changes - CORRECT EVENT NAME
      instance.addEventListener("viewState.zoom.change", (zoomLevel) => {
        console.log("🔍 Zoom changed to:", Math.round(zoomLevel * 100) + "%");
        mixpanelService.track("Zoom Change", {
          ...baseEventData,
          zoom_level: Math.round(zoomLevel * 100),
          zoom_factor: zoomLevel,
          event_source: "nutrient_sdk",
        });
      });

      // General View State Changes
      instance.addEventListener("viewState.change", (viewState) => {
        console.log("📐 View state changed:", viewState);
        mixpanelService.track("View State Change", {
          ...baseEventData,
          view_state_keys: Object.keys(viewState),
          event_source: "nutrient_sdk",
        });
      });

      // 2. ANNOTATION EVENTS - CORRECT EVENT NAMES

      // Annotation Creation
      instance.addEventListener("annotations.create", (createdAnnotations) => {
        const annotations = Array.isArray(createdAnnotations)
          ? createdAnnotations
          : [createdAnnotations];
        console.log("✏️ Annotations created:", annotations.length);

        annotations.forEach((annotation) => {
          mixpanelService.track("Annotation Created", {
            ...baseEventData,
            annotation_type:
              annotation.className || annotation.constructor.name,
            annotation_id: annotation.id,
            page_number: annotation.pageIndex + 1,
            has_content: !!(annotation.note || annotation.contents),
            event_source: "nutrient_sdk",
          });
        });
      });

      // Annotation Updates
      instance.addEventListener("annotations.update", (updatedAnnotations) => {
        const annotations = Array.isArray(updatedAnnotations)
          ? updatedAnnotations
          : [updatedAnnotations];
        console.log("✏️ Annotations updated:", annotations.length);

        annotations.forEach((annotation) => {
          mixpanelService.track("Annotation Updated", {
            ...baseEventData,
            annotation_type:
              annotation.className || annotation.constructor.name,
            annotation_id: annotation.id,
            page_number: annotation.pageIndex + 1,
            event_source: "nutrient_sdk",
          });
        });
      });

      // Annotation Deletion
      instance.addEventListener("annotations.delete", (deletedAnnotations) => {
        const annotations = Array.isArray(deletedAnnotations)
          ? deletedAnnotations
          : [deletedAnnotations];
        console.log("🗑️ Annotations deleted:", annotations.length);

        annotations.forEach((annotation) => {
          mixpanelService.track("Annotation Deleted", {
            ...baseEventData,
            annotation_type:
              annotation.className || annotation.constructor.name,
            annotation_id: annotation.id,
            page_number: annotation.pageIndex + 1,
            event_source: "nutrient_sdk",
          });
        });
      });

      // Annotation Selection
      instance.addEventListener("annotationSelection.change", (selection) => {
        console.log("🎯 Annotation selection changed");
        mixpanelService.track("Annotation Selection Changed", {
          ...baseEventData,
          selection_count: selection ? selection.length : 0,
          event_source: "nutrient_sdk",
        });
      });

      // Annotation Interactions
      instance.addEventListener("annotations.press", (annotation) => {
        console.log("👆 Annotation pressed:", annotation.id);
        mixpanelService.track("Annotation Pressed", {
          ...baseEventData,
          annotation_type: annotation.className || annotation.constructor.name,
          annotation_id: annotation.id,
          page_number: annotation.pageIndex + 1,
          event_source: "nutrient_sdk",
        });
      });

      // 3. TEXT SELECTION EVENTS - CORRECT EVENT NAME
      instance.addEventListener("textSelection.change", (selection) => {
        if (selection && selection.text && selection.text.trim().length > 0) {
          console.log("📝 Text selected:", selection.text.length, "characters");
          mixpanelService.track("Text Selection", {
            ...baseEventData,
            text_length: selection.text.length,
            page_number: selection.pageIndex + 1,
            event_source: "nutrient_sdk",
          });
        } else if (selection === null) {
          console.log("📝 Text selection cleared");
          mixpanelService.track("Text Selection Cleared", {
            ...baseEventData,
            event_source: "nutrient_sdk",
          });
        }
      });

      // 4. FORM FIELD EVENTS - CORRECT EVENT NAME
      instance.addEventListener("formFieldValues.update", (formFieldValues) => {
        console.log("📝 Form field updated");
        mixpanelService.track("Form Field Updated", {
          ...baseEventData,
          field_count: Object.keys(formFieldValues).length,
          event_source: "nutrient_sdk",
        });
      });

      // Form Fields Changes
      instance.addEventListener("formFields.change", (changes) => {
        console.log("📝 Form fields changed");
        mixpanelService.track("Form Fields Changed", {
          ...baseEventData,
          change_type: changes.type || "unknown",
          event_source: "nutrient_sdk",
        });
      });

      // 5. SEARCH EVENTS - CORRECT EVENT NAME
      instance.addEventListener("search.stateChange", (searchState) => {
        if (searchState.query && searchState.query.trim()) {
          console.log("🔍 Search performed:", searchState.query);
          mixpanelService.track("Search Performed", {
            ...baseEventData,
            query_length: searchState.query.length,
            results_count: searchState.results ? searchState.results.length : 0,
            is_case_sensitive: searchState.isCaseSensitive || false,
            is_whole_word: searchState.matchWholeWord || false,
            event_source: "nutrient_sdk",
          });
        }
      });

      instance.addEventListener("search.termChange", (searchTerm) => {
        console.log("🔍 Search term changed:", searchTerm);
        mixpanelService.track("Search Term Changed", {
          ...baseEventData,
          search_term_length: searchTerm ? searchTerm.length : 0,
          event_source: "nutrient_sdk",
        });
      });

      // 6. DOCUMENT MANIPULATION EVENTS - CORRECT EVENT NAME
      instance.addEventListener("document.change", (changes) => {
        console.log("📄 Document changed:", changes);
        mixpanelService.track("Document Modified", {
          ...baseEventData,
          change_type: changes.type || "unknown",
          event_source: "nutrient_sdk",
        });
      });

      instance.addEventListener("document.saveStateChange", (saveState) => {
        console.log("💾 Document save state changed:", saveState);
        mixpanelService.track("Document Save State Changed", {
          ...baseEventData,
          has_changes: saveState.hasUnsavedChanges,
          event_source: "nutrient_sdk",
        });
      });

      // 7. PAGE INTERACTIONS
      instance.addEventListener("page.press", (pageInfo) => {
        console.log("👆 Page pressed:", pageInfo.pageIndex + 1);
        mixpanelService.track("Page Pressed", {
          ...baseEventData,
          page_number: pageInfo.pageIndex + 1,
          event_source: "nutrient_sdk",
        });
      });

      // 8. BOOKMARKS
      instance.addEventListener("bookmarks.change", (bookmarks) => {
        console.log("🔖 Bookmarks changed");
        mixpanelService.track("Bookmarks Changed", {
          ...baseEventData,
          bookmark_count: bookmarks ? bookmarks.length : 0,
          event_source: "nutrient_sdk",
        });
      });

      // 9. COMMENTS
      instance.addEventListener("comments.change", (comments) => {
        console.log("💬 Comments changed");
        mixpanelService.track("Comments Changed", {
          ...baseEventData,
          comment_count: comments ? comments.length : 0,
          event_source: "nutrient_sdk",
        });
      });

      // 10. HISTORY (UNDO/REDO)
      instance.addEventListener("history.undo", () => {
        console.log("↶ Undo performed");
        mixpanelService.track("Undo Action", {
          ...baseEventData,
          event_source: "nutrient_sdk",
        });
      });

      instance.addEventListener("history.redo", () => {
        console.log("↷ Redo performed");
        mixpanelService.track("Redo Action", {
          ...baseEventData,
          event_source: "nutrient_sdk",
        });
      });

      // 11. SIGNATURES
      instance.addEventListener("inkSignatures.create", (signature) => {
        console.log("✍️ Ink signature created");
        mixpanelService.track("Ink Signature Created", {
          ...baseEventData,
          signature_id: signature.id,
          event_source: "nutrient_sdk",
        });
      });

      console.log(
        "✅ All Nutrient SDK event listeners registered successfully"
      );
    } catch (error) {
      console.error("❌ Error setting up Nutrient SDK events:", error);
      mixpanelService.track("Event Setup Error", {
        ...baseEventData,
        error_message: error.message,
        event_source: "setup_error",
      });
    }
  };

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
