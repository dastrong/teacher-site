import React, { cloneElement } from "react";
import InfoModal from "./InfoModal";
import { useStore } from "store";

export default function WithStoreAndInfo({ children, gameInfo, path }) {
  const { keyCuts, info, router } = gameInfo;
  const { icon } = router;
  const { attachments, attachURL, title, image } = info;

  const [store, dispatch] = useStore();
  const {
    vocabulary,
    expressions,
    isGameReady,
    font,
    colors,
    showSideBar,
    showDataModal,
  } = store;

  const isMenuOpen = showSideBar || showDataModal;

  const childProps = path.includes("/play")
    ? { title, font, isMenuOpen, vocabulary, expressions, colors }
    : { title, font, isGameReady, path, image, icon };

  const child = cloneElement(children, childProps);

  return (
    <>
      <InfoModal
        font={font}
        dispatch={dispatch}
        keyCuts={keyCuts}
        opacity={path.includes("/play") ? 0 : 1}
        path={path}
        title={title}
        attachments={attachments}
        attachURL={attachURL}
      />
      {child}
    </>
  );
}
