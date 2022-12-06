/** @jsxImportSource @emotion/react */

import React, { useState } from "react";
import { Box, Select, MenuItem, SelectChangeEvent, Typography, Button, Grid } from "@mui/material";
import { Description } from "@mui/icons-material";

import { Expando, Block } from "@sfdl/sf-mui-components";
import { laData } from "utils/authorityData";

interface StartPageProps {
  onClick: () => void;
}

const Start = (props: StartPageProps) => {
  const handleButtonClick = () => {
    console.log("button clicked");
    props.onClick();
  };

  /*const [localAuthority, SetLocalAuthority] = useState<string | null>(null);*/
  const [localAuthority, SetLocalAuthority] = useState<string>("Choose local authority")
  const renderDropdown = () => {
    return (
      <Select
        value={localAuthority}
        onChange={(event: SelectChangeEvent) => {
          SetLocalAuthority(event.target.value as string);
        }}
      >
        {laData.map((laItem) => {
          return <MenuItem value={laItem.la_id}>{laItem.la_name}</MenuItem>;
        })}
      </Select>
    );
  };

  let la_set = (localAuthority !== "Choose local authority") ? true : false

  return (
    <Box flexGrow={1}>
      <Block>
        <Typography variant="body1">
          Data to Insight is a national project led by local authorities with
          support from the ADCS, DLUHC, DfE and Ofsted to help local authorities
          make better use of data.
        </Typography>
      </Block>

      <Block>
        <Typography variant="body1">
          This tool was developed by local authority data analysts, supported by
          technical expertise from our friends at Social Finance. It will let
          you perform the same kinds of data validation as the DfE’s SSDA903
          statutory data submission tool. You can run this tool at any time,
          using your year-to-date extract of SSDA903 data. We recommend a
          monthly data checking cycle.
        </Typography>
      </Block>

      <Block spacing={"blockLarge"}>
        {renderDropdown()}
      </Block>

      <Block spacing={"blockLarge"}>
        {la_set ? (
          <Button
            onClick={handleButtonClick}
            variant="contained"
            sx={{ boxShadow: 0 }}
          >
            Start
          </Button>
        ) : (
          <Button disabled>Start</Button>
        )}
      </Block>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Block>
            <Expando
              id="release-notes-expander"
              Icon={Description}
              title="Release notes:"
            >
              <Typography>These are the release notes</Typography>
            </Expando>
          </Block>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Start;
