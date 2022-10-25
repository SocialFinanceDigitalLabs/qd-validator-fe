import { APIControl } from "api";
import { FileList } from "components/inputs/uploader/Upload";
import React, { Dispatch, useEffect, useContext, useState } from "react";
import { ReportAction, ReportErrors } from "reducers/ReportReducer";
import { RouteValue } from "Router";
import { APIConfigContext } from "App";
import { Box, Button, Grid, Typography } from "@mui/material";
import { ScrollableFull, HeaderControl } from "./Report.styles";

import SelectableTable from "components/selectabletable";
import ButtonPopover from "components/buttonpopover";
import ChildFilterDialog from "components/dialogs/childfilter";
import ReportDetail from "./ReportDetail";

interface ReportPageProps {
  handleRouteChange: (newRoute: RouteValue) => void;
  dispatch: Dispatch<ReportAction>;
  fileData: FileList;
  data: ReportErrors;
  api: APIControl;
}

const Report = (props: ReportPageProps) => {
  const apiConfig = useContext(APIConfigContext);
  const { handleRouteChange, api, data, dispatch } = props;
  const [selectedChild, setSelectedChild] = useState<string | null>(null);

  const handleRowSelect = (row: unknown[]) => {
    setSelectedChild(row[0] as string);
  };

  const renderTable = () => {
    if (!data.errorList) {
      return null;
    }

    const errorList = Object.values(data.errorList)
      .filter((errorItem) => {
        return errorItem.display !== false;
      })
      .map((errorItem) => {
        return [errorItem.code, errorItem.count];
      });

    return (
      <SelectableTable
        headers={["Code", "Count"]}
        rows={errorList}
        onRowSelect={handleRowSelect}
      />
    );
  };

  const renderDetailView = () => {
    if (selectedChild && data.errorList) {
      return <ReportDetail data={data.errorList[selectedChild]} />;
    }

    return <Typography variant="h6">Select child</Typography>;
  };

  return (
    <Box flexGrow={1}>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <ScrollableFull>
            <HeaderControl>
              <Typography variant="h6">Child ID</Typography>
              <ButtonPopover label="Filter">
                <ChildFilterDialog
                  filterString={data.errorFilter}
                  dispatch={dispatch}
                />
              </ButtonPopover>
            </HeaderControl>
            {renderTable()}
          </ScrollableFull>
        </Grid>
        <Grid item xs={9}>
          {renderDetailView()}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Report;