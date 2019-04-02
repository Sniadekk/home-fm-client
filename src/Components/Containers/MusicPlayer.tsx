/** @jsx jsx */ import { jsx, keyframes } from "@emotion/core";
import React, { Component } from "react";
import { Song, setRandomSong, isObjectEmpty } from "../../Actions/index";
import {
  IoIosSkipBackward,
  IoIosSkipForward,
  IoIosPlay,
  IoIosVolumeHigh,
  IoIosVolumeLow,
  IoIosVolumeMute
} from "react-icons/io";
import { FaAngleDoubleUp, FaAngleDoubleDown } from "react-icons/fa";
import { Button, Avatar, Slider, List } from "antd";
import { formatArtists } from "../Presentational";
import { Dispatch } from "redux";
import { ReduxState } from "../../Stores";
import { connect } from "react-redux";
import { css } from "@emotion/core";
type MusicPlayerProps = {
  previousSongs: Song[];
  activeSong: Song;
  nextSong: () => void;
  previousSong: () => void;
};

function convertTime(time: number) {
  const seconds = Math.floor(time / 1000);
  const mins = Math.floor(seconds / 60);
  const secondsRemaining = seconds - mins * 60;

  // if seconds are less than 10 add 0 at the begining of the string so it looks like 0:01
  return `${mins}:${
    secondsRemaining < 10 ? `0${secondsRemaining}` : secondsRemaining
  }`;
}

const expanderStyle = css({
  position: "absolute",
  marginLeft: "auto",
  marginRight: "auto",
  top: "-0.75rem",
  borderTopRightRadius: "20%",
  borderTopLeftRadius: "20%",
  background: "#282828",
  cursor: "pointer"
});

const expandTop = keyframes`
  from {
    top:85%;
  }
  to {
    top:2%;
  }
`;

const expandBottom = keyframes`
  from {
    top:2%;
  }
  to {
    top:85%;
  }
`;

const musicPlayer = (clicked: boolean) =>
  css({
    background: "#282828",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end",
    width: "100%",
    marginLeft: "auto",
    marginRight: "auto",
    position: "fixed",
    bottom: 0,
    top: clicked ? "2%" : "85%",
    animation: clicked ? `${expandTop} 1.5s ease` : `${expandBottom} 1.5s ease`,
    flexWrap: "wrap"
  });

const playerTools = css({
  width: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-end"
});

//const currentSong = css({});

class MusicPlayer extends Component<MusicPlayerProps> {
  state = {
    progress: 0,
    clicked: false
  };

  render() {
    const { duration_ms } = this.props.activeSong;
    const isSongSet = !isObjectEmpty(this.props.activeSong);
    return (
      <div css={musicPlayer(this.state.clicked)}>
        {this.state.clicked && isSongSet && <SongsQueue />}
        <div css={playerTools}>
          <span
            onClick={() => this.setState({ clicked: !this.state.clicked })}
            css={expanderStyle}
          >
            {this.state.clicked ? <FaAngleDoubleDown /> : <FaAngleDoubleUp />}
          </span>
          {isSongSet && <ActiveSong activeSong={this.props.activeSong} />}
          <div className="center-panel">
            <div className="functional-buttons">
              <Button ghost onClick={() => this.props.previousSong()}>
                <IoIosSkipBackward />
              </Button>
              <Button ghost>
                <IoIosPlay />
              </Button>
              <Button ghost onClick={() => this.props.nextSong()}>
                <IoIosSkipForward />
              </Button>
            </div>
            <div className="song-progress">
              <SongTimer duration_ms={duration_ms} />
            </div>
          </div>
          <div className="song-volume">
            <VolumeSlider />
          </div>
        </div>
      </div>
    );
  }
}

const fadeOut = keyframes`
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0%);
  }
`;

const songsQueue = css({
  animation: `${fadeOut} 1.5s ease`,
  overflow: "hidden",
  width: "100%",
  display: "flex",
  justifyContent: "center"
});

class SongsQueue extends Component {
  render() {
    return (
      <div css={songsQueue} className="active-song">
        <List
          dataSource={[{ name: "xD" }, { name: "pozdro" }]}
          bordered={true}
          size={"large"}
          itemLayout="horizontal"
          renderItem={(x: any) => <span>{x.name}</span>}
        />
      </div>
    );
  }
}

type SongTimerProps = {
  duration_ms: number;
};

class SongTimer extends Component<SongTimerProps> {
  state = {
    progress: 0
  };

  constructor(props: any) {
    super(props);
    setInterval(
      () => this.setState({ progress: this.state.progress + 1 }),
      1000
    );
  }

  componentWillReceiveProps(props: SongTimerProps) {
    if (props.duration_ms !== this.props.duration_ms) {
      this.setState({ progress: 0 });
    }
  }

  render() {
    const { duration_ms } = this.props;
    return (
      <div style={{ width: "100%" }}>
        <Slider
          tooltipVisible={false}
          marks={{
            0: {
              style: {
                color: "#ffffff"
              },
              label: <strong>{convertTime(this.state.progress * 1000)}</strong>
            },
            [duration_ms / 1000]: {
              style: {
                color: "#ffffff"
              },
              label: <strong>{convertTime(duration_ms)}</strong>
            }
          }}
          step={1}
          value={this.state.progress}
          min={0}
          max={duration_ms / 1000}
        />
      </div>
    );
  }
}

class VolumeSlider extends Component {
  state = { currentVolume: 0 };
  render() {
    const { currentVolume } = this.state;
    return (
      <div
        style={{
          width: "100%",
          display: "flex",
          flexWrap: "nowrap",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        {currentVolume < 50 && currentVolume !== 0 && <IoIosVolumeLow />}
        {currentVolume >= 50 && <IoIosVolumeHigh />}
        {currentVolume === 0 && <IoIosVolumeMute />}

        <Slider
          onChange={currentVolume => this.setState({ currentVolume })}
          style={{ width: "100%" }}
          defaultValue={0}
        />
      </div>
    );
  }
}

type ActiveSongProps = {
  activeSong: Song;
};

class ActiveSong extends Component<ActiveSongProps> {
  render() {
    return (
      <div className="active-song">
        <Avatar
          size={50}
          shape={"square"}
          src={this.props.activeSong.album.images[0].url}
        />
        <div style={{ display: "inline-block", paddingLeft: "0.5rem" }}>
          <div style={{ fontSize: "0.9rem", width: "100%" }}>
            {this.props.activeSong.name}
          </div>
          <div style={{ fontSize: "0.7rem", width: "100%", color: "#b3b3b3" }}>
            {formatArtists(this.props.activeSong.artists)}
          </div>
        </div>
      </div>
    );
  }
}

// Music player's dispatch to props and state to props
const mapStateToProps = (state: ReduxState) => {
  return {
    songs: state.songs,
    previousSongs: state.previousSongs,
    activeSong: state.activeSong
  };
};

const dispatchToProps = (dispatch: Dispatch) => {
  return {
    // set some random song to be active and save it in previousSongs history
    nextSong: () => {
      // dispatch(setRandomSong(true));
    },
    // set last element of previousSongs array to be active song then pop it off
    // if there are no elements in the previousSongs array a random song will be set to be active
    previousSong: () => {
      //dispatch(setPreviousSong());
    }
  };
};

export const MusicPlayerComponent = connect(
  mapStateToProps,
  dispatchToProps
)(MusicPlayer);
