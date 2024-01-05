import {useState} from "react";
import {ActionIcon, Anchor, Button, Drawer, Group, Progress, Stack, Text, ThemeIcon, Tooltip} from "@mantine/core";
import {useForm} from "@mantine/form";
import {progressFiles} from "./lib/table_tool.ts";

import classes from "./App.module.css";
import FolderButton from "./components/FolderButton.tsx";
import {useDisclosure} from "@mantine/hooks";
import {IconLock, IconSettings, IconSettingsOff} from "@tabler/icons-react";
import Settings from "./components/Settings.tsx";
import {SheetOptions} from "./lib/types.ts";

function App() {

    const [opened, {toggle}] = useDisclosure(false)

    const formValues = useForm({
        initialValues: {
            files: null,
            skipHeaderRows: 0,
            skipFooterRows: 0,
            useColumns: [],
            useSheets: [],
            minFileAge: undefined,
            maxFileAge: undefined,
            removeEmptyRows: true,
            removeRowsWithEmptyColumn: false,
            maxFileCount: 1_000,
            maxFileSizeMB: 10,
        } as {
            files: null | FileList,
        } & SheetOptions
    })

    const [progress, setProgress] = useState(0)

    return (
        <div className={classes.container}>

            <Drawer opened={opened} withCloseButton={false} onClose={toggle}>
                <Settings formValues={formValues} close={toggle}/>
            </Drawer>

            <Text
                component={"h1"}
                fw={900}
                fz={30}
                variant="gradient"
                gradient={{from: 'blue', to: 'cyan', deg: 90}}
                ta={"center"}
            >
                Excel Merger
            </Text>

            <Text c={"dimmed"} size={"sm"} ta={"center"}>
                This tool merges multiple Excel tables into one.
            </Text>
            <Text c={"dimmed"} size={"sm"} ta={"center"}>
                Get started by selecting a folder containing the files you want to merge.
            </Text>

            <div className={classes.middleContainer}>
                <FolderButton
                    disabled={progress !== 0 && progress !== 100}
                    value={formValues.values.files}
                    onChange={(files) => {
                        formValues.setFieldValue('files', files)
                    }}
                />

                {
                    (progress !== 0 && progress !== 100) && <>
                        <Stack align={"center"}>
                            <Text size={"xs"} c={"dimmed"}>
                                Processing {Math.round(progress)}%... please don't close the browser window.
                            </Text>
                            <Progress value={progress} w={"100%"}/>
                            <Text size={"xs"} c={"dimmed"}>
                                The browser may freeze for a few seconds.
                            </Text>
                        </Stack>
                    </>
                }

                <div className={classes.row}>
                    <Tooltip label={"Settings"}>
                        <ActionIcon variant={"transparent"} onClick={toggle} aria-label={"Settings"}>
                            {opened ? <IconSettingsOff/> : <IconSettings/>}
                        </ActionIcon>
                    </Tooltip>
                    <Button
                        onClick={() => {
                            progressFiles(
                                formValues.values.files!,
                                setProgress,
                                formValues.values,
                            ).finally(() => {
                                formValues.setFieldValue('files', null)
                                setProgress(0)
                            })
                        }}
                        disabled={!formValues.values.files}
                        loading={progress !== 0 && progress !== 100}
                    >
                        Start
                    </Button>
                </div>
            </div>

            <Group gap={"1ch"} justify={"center"}>
                <ThemeIcon variant={"transparent"} size={"xs"}>
                    <IconLock/>
                </ThemeIcon>
                <Text c={"dimmed"} size={"xs"} ta={"center"}>
                    100% DSGVO compliant!
                </Text>
            </Group>
            <Text c={"dimmed"} size={"xs"} ta={"center"}>
                Everything happens locally in your browser. No data is sent to any server.
            </Text>
            <Text c={"dimmed"} size={"xs"} ta={"center"}>
                Made with ❤️ by <Anchor target={"_blank"} href={"https://kolb-antik.website"}>Kolb Antik</Anchor>
            </Text>
        </div>
    )
}

export default App
