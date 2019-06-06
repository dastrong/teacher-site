import React, { useCallback, useEffect } from "react";
import shuffle from "lodash/shuffle";
import { CSSTransition } from "react-transition-group";
import { Button, Popup } from "semantic-ui-react";
import useSetData from "../../hooks/useSetData";
import useUpdateData from "../../hooks/useUpdateData";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { newGoogEvent, getRandomNum } from "../../helpers/phase2helpers";
import "./Bowling.css";

const letterBuffer = 3;
const animDuration = 7;
const reset = { showAnswer: false, isGameOver: false, isBowling: false, round: 1 };

const init = data => ({
  data: shuffle(data),
  text: "",
  splitText: [],
  left: [],
  bowlColors: [],
  rounds: 3,
  ...reset,
});

function reducer(state, action) {
  const { type, data, text, left, bowlColors, splitText, rounds } = action;
  switch (type) {
    case "Set_Data":
      return { ...state, data: shuffle(data) };
    case "New_Round":
      return { ...state, ...reset, data, text, left, bowlColors, splitText };
    case "Bowl_Start":
      return { ...state, isBowling: true };
    case "Bowl_Next":
      return { ...state, isBowling: false, round: state.round + 1 };
    case "Bowl_Done":
      return { ...state, isBowling: false, isGameOver: true };
    case "Show_Answer":
      return { ...state, isGameOver: false, showAnswer: true };
    case "Shuffle_Letters":
      return { ...state, splitText: shuffle(state.splitText) };
    case "Change_Rounds":
      return { ...state, ...reset, rounds };
    default:
      return state;
  }
}

export default function Bowling(props) {
  const { title, isMenuOpen, font, dataUpdated, vocabulary, colors } = props;
  const [state, dispatch] = useSetData(reducer, vocabulary, init);
  const handleGameRef = useCallback(handleGame, [dataUpdated]);
  const {
    data,
    text,
    left,
    round,
    rounds,
    bowlColors,
    splitText,
    showAnswer,
    isGameOver,
    isBowling,
  } = state;
  const handleGameKey = useCallback(handleGame, [data]);
  const roundTime =
    (splitText.length * letterBuffer + animDuration - letterBuffer / 2) * 1000;
  useDocumentTitle(`Playing - ${title} - ESL in the ROK`);
  useUpdateData(dataUpdated, handleGameRef);

  useEffect(() => {
    if (!isBowling) return;
    const id =
      round < rounds
        ? setTimeout(() => dispatch({ type: "Bowl_Next" }), roundTime)
        : setTimeout(() => dispatch({ type: "Bowl_Done" }), roundTime);
    return () => clearTimeout(id);
  }, [dispatch, isBowling, round, rounds, roundTime]);

  useEffect(() => {
    function handleKeys({ keyCode }) {
      if (isMenuOpen) return;
      if (keyCode === 32 || keyCode === 13) return handleGameKey();
      if (keyCode === 39) {
        if (rounds === 5) return;
        return dispatch({ type: "Change_Rounds", rounds: rounds + 1 });
      }
      if (keyCode === 37) {
        if (rounds === 1) return;
        return dispatch({ type: "Change_Rounds", rounds: rounds - 1 });
      }
    }
    document.addEventListener("keydown", handleKeys);
    return () => {
      document.removeEventListener("keydown", handleKeys);
    };
  }, [dispatch, isMenuOpen, handleGameKey, rounds]);

  function handleGame() {
    // GOOGLE EVENTS ARE SENT WHEN USER STARTS A ROUND, NOT HERE
    const [text, ...rest] = data;
    const newData = rest.length < 1 ? shuffle(vocabulary) : rest;
    const splitText = shuffle(text.split(""));
    const bowlColors = shuffle(colors).slice(0, splitText.length - 1);
    const left = splitText.map(() => getRandomNum(window.innerWidth));
    dispatch({ type: "New_Round", text, data: newData, splitText, bowlColors, left });
  }

  return (
    <div className="bowling-container" style={{ fontFamily: font }}>
      <Controls
        dispatch={dispatch}
        handleGame={handleGameKey}
        isBowling={isBowling}
        isGameOver={isGameOver}
        showAnswer={showAnswer}
        round={round}
        title={title}
      />
      {/* ROUND COUNTER */}
      <p className="total-round-counter">
        {round}/{rounds}
      </p>
      {/* ROUND TEXT */}
      <Text
        text="Ready?"
        isIn={!isBowling && !isGameOver && !showAnswer}
        className="round-text"
      />
      <Text
        text="???"
        isIn={isGameOver}
        className="round-question"
        onClick={() => dispatch({ type: "Show_Answer" })}
      />
      <Text text={text} isIn={showAnswer} className="round-answer" />
      <Letters
        splitText={splitText}
        isBowling={isBowling}
        left={left}
        bowlColors={bowlColors}
      />
    </div>
  );
}

const Controls = ({
  dispatch,
  handleGame,
  isBowling,
  isGameOver,
  showAnswer,
  round,
  title,
}) => {
  const disable = isBowling || isGameOver || showAnswer;
  return (
    <div className="bowling-btns">
      <BtnTip
        onClick={() => dispatch({ type: "Shuffle_Letters" })}
        content="Shuffle the letters"
        position="left center"
        disabled={disable || round === 1}
        icon="shuffle"
      />
      <BtnTip
        onClick={() => {
          if (round === 1) {
            newGoogEvent(title);
          }
          dispatch({ type: "Bowl_Start" });
        }}
        content="Start the round"
        position="bottom center"
        disabled={disable}
        icon="play"
        color={!disable ? "blue" : ""}
      />
      <BtnTip
        onClick={handleGame}
        content="Get a new word and reset"
        position="right center"
        icon="refresh"
        color={showAnswer ? "blue" : ""}
      />
    </div>
  );
};

const BtnTip = ({ position, content, ...btnProps }) => (
  <Popup
    position={position}
    content={content}
    flowing={true}
    hoverable={false}
    trigger={<Button circular size="massive" {...btnProps} />}
  />
);

const Text = ({ isIn, text, className, ...clicker }) => (
  <CSSTransition in={isIn} timeout={0} classNames={className} mountOnEnter unmountOnExit>
    <p className={className} {...clicker}>
      {text}
    </p>
  </CSSTransition>
);

const Letters = ({ splitText, isBowling, left, bowlColors }) => {
  const delayMultiplier = letterBuffer * 1000;
  return splitText.map((text, i) => {
    const backgroundColor = bowlColors[i] || bowlColors[i - bowlColors.length];
    return (
      <Letter
        key={text + i}
        isIn={isBowling}
        text={text}
        timeout={i * delayMultiplier}
        style={{ left: left[i], backgroundColor }}
      />
    );
  });
};

const Letter = ({ isIn, text, timeout, style }) => (
  <CSSTransition classNames="letterDrop" in={isIn} timeout={timeout}>
    <span className="letterDrop" style={style}>
      {text}
    </span>
  </CSSTransition>
);
