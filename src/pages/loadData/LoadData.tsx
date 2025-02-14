/** @jsxImportSource @emotion/react */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Typography,
} from "@mui/material";
import { FormatListNumbered } from "@mui/icons-material";

import { Aligner } from "../Pages.styles";

import { ReportActionType } from "reducers/ReportReducer";
import { FileActionType } from "reducers/FileReducer";

import {
  Expando,
  Tabs,
  SelectableList as Selectablelist,
  Loader,
  Upload as Uploader,
  Block,
} from "@sfdl/sf-mui-components";

import PrimaryControls from "components/primarycontrols";
import { generateCSV } from "utils/file/generateCSV";

import { RouteProps, RouteValue } from "../../Router";

import { downloadFile } from "utils/file/download";

interface LoadDataPageProps extends RouteProps {
  handleRouteChange: (route: RouteValue) => void;
}

type Rule = {
  value: string;
  label: string;
};

const LoadData = (props: LoadDataPageProps) => {
  const { dispatch, api, fileState, fileDispatch, data } = props;
  const validationRules = data.validationRules;

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  useEffect(() => {
    const init = async () => {
      setLoadingMessage("Loading rules");
      setLoading(true);

      const rules = await api.call("get_rules", {});
      const parsedRules = JSON.parse(rules).map(
        (rule: { code: string; description: string }) => {
          return {
            value: rule.code,
            label: rule.description,
          };
        }
      );

      dispatch({
        type: ReportActionType.SET_VALIDATION_RULES,
        payload: parsedRules,
      });

      setSelectedValidationRules(getInitialSelectedRuleState(parsedRules));
      setLoading(false);
    };

    init();
  }, []);

  const getInitialSelectedRuleState = (rules: Rule[]): string[] => {
    if (rules.length === 0) {
      return [];
    }

    return rules.map((rule) => rule.value);
  };

  const [selectedValidationRules, setSelectedValidationRules] = useState<
    string[]
  >([]);

  const handleResetClick = () => {
    dispatch({ type: ReportActionType.RESET, payload: {} });
    fileDispatch({ type: FileActionType.CLEAR_FILES, payload: {}, year: "" });
  };

  const generateCSVFile = (tables: any): void => {
    Object.keys(tables).forEach((table) => {
      const output = generateCSV(Object.values(JSON.parse(tables[table])));

      if (output) {
        downloadFile(output, `${table}.csv`);
      }
    });
  };

  const getTotalFilesLength = (): number => {
    return Object.values(fileState).reduce((prevVal, currVal) => {
      return (prevVal as number) + Object.values(currVal as Object).length;
    }, 0) as number;
  };

  const handleNextClick = async () => {
    if (api && fileState) {
      const file = fileState["2023"];

      try {
        setLoadingMessage("Running analysis, this may take some time");
        setLoading(true);

        const fileObject: any = Object.values(file)[0] as any;
        const tables = await api.call("generate_tables", fileObject.file);

        const errorArgs = [fileObject.file];

        if (selectedValidationRules.length > 0) {
          errorArgs.push(selectedValidationRules);
        }

        const errors = await api.call("cin_validate", errorArgs);

        setLoading(false);
        dispatch({
          type: ReportActionType.SET_CHILDREN,
          payload: { tables, errors },
        });

        props.handleRouteChange(RouteValue.REPORT);
      } catch (ex) {
        setLoading(false);
        console.log("API add_files request failed", ex);
        alert("Something went wrong!");
      }
    }
  };

  const handleGenerateCSVClick = async () => {
    if (api && fileState && data) {
      if (!data.tables) {
        const file = fileState["2023"];

        try {
          setLoadingMessage("Generating CSV file");
          setLoading(true);

          const fileObject: any = Object.values(file)[0] as any;
          const tables = await api.call("generate_tables", fileObject.file);
          setLoading(false);

          generateCSVFile(tables);

          dispatch({
            type: ReportActionType.SET_TABLES,
            payload: { tables },
          });
        } catch (ex) {
          setLoading(false);
          console.log("API add_files request failed", ex);
          alert("Something went wrong!");
        }
      }
    } else {
      generateCSVFile(data.tables);
    }
  };
  const renderInstructions = () => {
    const instructions = [
      {
        label: `Upload an XML file for the CIN census by clicking on the arrow below. 
        If you have CSVs, convert them into XML using the DfE XML Generator.`,
        content: null,
      },
      {
        label: `If you only want to only run the validation for certain rules, use the
        'Validation Rules' dropdown to select the ones you want.
      `,
        content: null,
      },
      {
        label: `Click 'Validate' to run the selected checks. When complete, the Error
        Display screen will appear.
      `,
        content: null,
      },
      {
        label: `On the Error Display screen:`,
        content: (
          <ul>
            <li>
              <Typography variant="body2">
                Use the 'Child ID' sidebar to select individual children.
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Scroll down to see the failing locations for the child across
                all recorded tables. Cells with errors are highlighted in blue
                when you click on the error description.
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                If you click the 'Filter' button, you can type to search for a
                Child ID, or scroll down and click to display only children with
                a particular error.
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                To download the Error Report spreadsheet, scroll to the bottom
                of the page and click the 'Download Error Reports' button
              </Typography>
            </li>
          </ul>
        ),
      },
    ];

    return (
      <Stepper orientation="vertical" activeStep={-1}>
        {instructions.map((ins, idx) => {
          return (
            <Step key={ins.label} active={true}>
              <StepLabel>{ins.label}</StepLabel>
              <StepContent>{ins.content}</StepContent>
            </Step>
          );
        })}
      </Stepper>
    );
  };

  const renderXMLTab = () => {
    return (
      <Box>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h6">Upload CIN XML file</Typography>
            <Uploader
              onUploadReady={(files: any) => {
                fileDispatch({
                  type: FileActionType.ADD_FILES,
                  payload: files || {},
                  year: "2023", //redundant
                });
              }}
              maxFiles={1}
              fileList={fileState["2023"]}
            />
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderFileTabs = () => {
    const headers = [{ label: "XML File" }];

    const bodies = [renderXMLTab()];

    return <Tabs headers={headers} bodies={bodies} id="file-upload-tabs" />;
  };

  const getValidationRulesSummary = () => {
    if (!validationRules) {
      return "";
    }

    const totalRulesLength = validationRules.length;
    const selectedRulesLength = selectedValidationRules.length;
    const unselectedRulesLength = totalRulesLength - selectedRulesLength;

    return `${selectedRulesLength} selected, ${unselectedRulesLength} unselected`;
  };

  return (
    <div>
      {loading && <Loader type="cover" label={loadingMessage} />}
      <Box flexGrow={1}>
        <Block>
          This tool will load Python code in your web browser to read and
          validate your CIN data files locally. None of your CIN data will leave
          your network via this tool. You can safely use it without installing
          additional software, and without any data sharing agreement. Once the
          Python code has loaded, the tool will work entirely offline.
        </Block>
        <Block spacing="blockLarge">
          To begin, use the boxes below to locate and upload your local CIN
          file. Select the validation rules you want to run, and use the
          “validate” button to get started. By default, all rules will be run if
          no specific rules are selected.
          <br />
          <br />
          If you simply want to convert your XML file into CSVs, you can click
          on "download CSVs" without the need to go through the validation
          process first.
        </Block>
        <Block spacing="blockLarge">
          <Expando
            Icon={FormatListNumbered}
            id="instructions-list"
            title="Instructions"
          >
            {renderInstructions()}
          </Expando>
        </Block>
        <Block spacing="blockLarge">
          <Box>{renderFileTabs()}</Box>
        </Block>
        <Block spacing="blockLarge">
          {validationRules && validationRules.length > 0 && (
            <Expando
              defaultExpanded={false}
              id="validation-rules-expander"
              title={`Validation Rules (${getValidationRulesSummary()})`}
            >
              <Selectablelist
                initialSelectedItems={getInitialSelectedRuleState(
                  validationRules
                )}
                values={validationRules}
                onItemSelected={(selectedRules: string[]) => {
                  setSelectedValidationRules(selectedRules);
                }}
              />
            </Expando>
          )}
        </Block>
        <Block spacing="blockLarge">
          <Aligner>
            <PrimaryControls
              disableDownload={getTotalFilesLength() < 1}
              disableButtons={
                getTotalFilesLength() < 1 || selectedValidationRules.length < 1
              }
              disableUserReport={!data || !data.userReport}
              onClearClick={handleResetClick}
              onValidateClick={handleNextClick}
              onGenerateClick={handleGenerateCSVClick}
              onReportClick={() => {}}
            />
          </Aligner>
        </Block>
      </Box>
    </div>
  );
};

export default LoadData;
