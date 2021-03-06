/** @jsx jsx */

import { jsx, css } from "@emotion/core";
import { Input, notification, Form, Button, Switch } from "antd";
import React from "react";
import styled from "@emotion/styled";
import { useState } from "react";
import { FormComponentProps } from "antd/lib/form";
import { store } from "../../Stores/index";
import { Song, SongReadiness } from "../../Actions/types";
import { addSongsToQueue, scheduleSong } from "../../Actions/index";

const SearchContainer = styled.div({
  margin: "auto",
  width: "95%"
});

const SearchForm = css({
  paddingTop: "0.7rem"
});

export const YoutubeSearch = () => {
  return (
    <SearchContainer>
      <SongSearchForm />
    </SearchContainer>
  );
};

type SongSearchProps = {};
type FormValues = {
  artists: string;
  songName: string;
  nsfw: boolean;
};

const SongSearch = (props: SongSearchProps & FormComponentProps) => {
  const { getFieldDecorator } = props.form;
  // flag to stop form for a second after submit
  const [disabled, setDisabled] = useState(false);

  return (
    <Form
      css={SearchForm}
      onSubmit={e => {
        // validate form and prevent default from refreshing the page
        e.preventDefault();
        props.form.validateFields((err, values: FormValues) => {
          if (!err) {
            // clear form
            props.form.resetFields();
            // create new song, so we can use logic used in normal queue
            const song: Song = {
              id: "none",
              name: values.songName,
              artists: values.artists,
              formatted_name: `${values.artists} - ${values.songName}`,
              duration: 0,
              thumbnail_url: "none",
              isReady: SongReadiness.NOT_READY,
              nsfw: values.nsfw
            };

            // schedule song and add it to queue
            scheduleSong(song);
            // turn off form for a second, so user won't spam it
            setDisabled(true);
            setTimeout(() => {
              setDisabled(false);
              notification.info({
                message: "Searching song on youtube...",
                description: song.formatted_name
              });
            }, 500);
          }
        });
      }}
    >
      <Form.Item required={true}>
        {getFieldDecorator("artists", {
          rules: [
            { required: true, message: "Please specify atleast one artist!" }
          ]
        })(<Input placeholder="artists..." />)}
      </Form.Item>
      <Form.Item>
        {getFieldDecorator("songName", {
          rules: [
            {
              required: true,
              message: "how can I play a song if I don't know its name?"
            }
          ]
        })(<Input placeholder="song name..." />)}
      </Form.Item>
      <Form.Item label="nsfw">
        {getFieldDecorator("nsfw", {
          rules: [
            {
              required: true,
              message: "how can I play a song if I don't know its name?"
            }
          ],
          initialValue: true
        })(<Switch defaultChecked />)}
      </Form.Item>
      <Form.Item required={true}>
        <Button loading={disabled} type="primary" htmlType="submit">
          Search
        </Button>
      </Form.Item>
    </Form>
  );
};

const SongSearchForm = Form.create({})(SongSearch);
