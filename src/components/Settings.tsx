import {
    ActionIcon,
    Autocomplete,
    Button,
    Fieldset,
    Group,
    Indicator,
    Modal,
    NumberInput,
    Stack,
    Switch,
    Text,
    TextInput,
    ThemeIcon,
    Title,
    Tooltip
} from "@mantine/core";
import CountInput from "./CountInput.tsx";
import ListInput from "./ListInput.tsx";
import {DateInput} from "@mantine/dates";
import {UseFormReturnType} from "@mantine/form";
import {IconArrowRight, IconInfoCircle, IconReload, IconSettingsDown, IconSettingsUp} from "@tabler/icons-react";
import {useState} from "react";
import {SheetOptions} from "../lib/types.ts";

const LOCAL_STORAGE_KEY = "TABLE_MERGER_SETTINGS_"

const SaveSettingsDialog = ({settings, close}: { settings: SheetOptions, close: () => void }) => {
    const [saveSettingsName, setSaveSettingsName] = useState("")
    return <>
        <Stack>
            <Title order={3}>
                Save Settings
            </Title>

            <Text c={"dimmed"} size={"sm"}>
                Save the settings to use them later again.
                The setting will be saved to the local storage of your browser.
                This means that only you can access the saved settings in your browser.
            </Text>

            <TextInput
                label={"Label"}
                description={"Enter a name for the settings. Settings with the same name will be overwritten!"}
                placeholder={"My Settings"}
                required
                value={saveSettingsName}
                onChange={(e) => {
                    setSaveSettingsName(e.currentTarget.value)
                }}
            />

            <Group>
                <Button
                    variant={"subtle"}
                    onClick={() => {
                        setSaveSettingsName("")
                        close()
                    }}
                >
                    Cancel
                </Button>
                <Button
                    color={"green"}
                    disabled={saveSettingsName === ""}
                    onClick={() => {

                        localStorage.setItem(`${LOCAL_STORAGE_KEY}${saveSettingsName}`, JSON.stringify({
                            ...settings,
                            files: null,
                        }))
                        setSaveSettingsName("")
                        close()
                    }}
                >
                    Save
                </Button>
            </Group>
        </Stack>
    </>
}

const LoadSettingsDialog = ({close, setSettings}: {
    close: () => void,
    setSettings: (settings: SheetOptions) => void
}) => {

    const [value, setValue] = useState('');

    const settings = Object.keys(localStorage)
        .filter(key => key.startsWith(LOCAL_STORAGE_KEY))
        .map(key => key.replace(LOCAL_STORAGE_KEY, ""))
        .map(key => {
            return {
                label: key,
                value: key
            }
        })

    return <>
        <Stack>
            <Title order={3}>
                Load Settings
            </Title>

            <Text c={"dimmed"} size={"sm"}>
                Here you can load settings that you have saved before.
            </Text>

            {settings.length === 0 ?
                <Text c={"red"}>
                    You have no saved settings.
                </Text> :
                <Autocomplete
                    label={"Settings"}
                    description={"Select the settings you want to load."}
                    placeholder={"Select Settings"}
                    data={settings.map(o => o.label)}
                    value={value}
                    onChange={setValue}
                />
            }

            <Group>
                <Button
                    variant={"subtle"}
                    onClick={() => {
                        close()
                    }}
                >
                    Cancel
                </Button>
                <Button
                    disabled={value === ""}
                    color={"green"}
                    onClick={() => {
                        const settings = localStorage.getItem(`${LOCAL_STORAGE_KEY}${value}`)
                        setSettings(JSON.parse(settings!))
                        close()
                    }}
                >
                    Load
                </Button>
            </Group>
        </Stack>
    </>
}

export default function Settings({formValues, close}: {
    formValues: UseFormReturnType<any & SheetOptions>,
    close: () => void
}) {

    const [showSaveDialog, setShowSaveDialog] = useState(false)
    const [showLoadDialog, setShowLoadDialog] = useState(false)

    return <>

        <Stack>
            <Modal opened={showSaveDialog} onClose={() => setShowSaveDialog(false)} withCloseButton={false}>
                <SaveSettingsDialog settings={formValues.values} close={() => setShowSaveDialog(false)}/>
            </Modal>

            <Modal opened={showLoadDialog} onClose={() => setShowLoadDialog(false)} withCloseButton={false}>
                <LoadSettingsDialog
                    setSettings={(s) => formValues.setValues({
                        ...formValues.values, ...s,
                        files: formValues.values.files
                    })}
                    close={() => setShowLoadDialog(false)}
                />
            </Modal>

            <Title order={2}>
                Settings
            </Title>

            <Text c={"dimmed"} size={"sm"}>
                Adjust the settings to your needs.
                The settings will be applied automatically when start the process - no need to save them.
                At the bottom you can download the settings to use them later again or load settings that you have saved
                before.
            </Text>

            <Fieldset legend="Row Settings">
                <Stack>
                    <CountInput
                        label={"Skip Header Rows"}
                        min={0}
                        description={"The number of rows to skip at the top of each sheet. Empty rows are not counted."}
                        {...formValues.getInputProps('skipHeaderRows')}
                    />

                    <CountInput
                        label={"Skip Footer Rows"}
                        min={0}
                        description={"The number of rows to skip at the bottom of each sheet. Empty rows are not counted."}
                        {...formValues.getInputProps('skipFooterRows')}
                    />

                    <Switch
                        label={"Remove Empty Rows (recommended)"}
                        description={"Remove rows that are completely empty."}
                        {...formValues.getInputProps('removeEmptyRows', {type: 'checkbox'})}
                    />
                </Stack>
            </Fieldset>

            <Fieldset legend="Column Settings">
                <Stack>
                    <ListInput
                        label={"Columns"}
                        itemPrefix={"Column: "}
                        emptyLabel={"Leave empty to use all columns."}
                        description={"Which columns to select from each sheet. Enter the column letter. e.g. A, B, C, ..."}
                        {...formValues.getInputProps('useColumns')}
                    />
                    <Switch
                        label={"Remove Rows with empty cells"}
                        disabled={formValues.values.useColumns.length === 0}
                        description={"Remove rows that have one or more empty cells. This setting is only applied if you have selected columns."}
                        {...formValues.getInputProps('removeRowsWithEmptyColumn', {type: 'checkbox'})}
                    />
                </Stack>
            </Fieldset>

            <Fieldset legend="Sheet Settings">
                <ListInput
                    label={"Sheets"}
                    itemPrefix={"Sheet: "}
                    emptyLabel={"Leave empty to use all sheets."}
                    description={"Which sheets to use. You can enter the sheet name or index."}
                    {...formValues.getInputProps('useSheets')}
                />
            </Fieldset>

            <Fieldset legend="File Settings">
                <Stack>
                    <DateInput
                        label={"Min File Age"}
                        description={"Ignore files that are younger than this."}
                        placeholder={"Leave empty to use all files."}
                        clearable
                        {...formValues.getInputProps('minFileAge')}
                    />

                    <DateInput
                        label={"Max File Age"}
                        description={"Ignore files that are older than this."}
                        placeholder={"Leave empty to use all files."}
                        clearable
                        {...formValues.getInputProps('maxFileAge')}
                    />
                </Stack>
            </Fieldset>


            <Fieldset legend="Performance Settings">
                <Stack>
                    <CountInput
                        label={"File Chunks"}
                        min={0}
                        description={"This setting limits the number of files processed simultaneously to reduce memory usage. " +
                            "If your browser window freezes, consider lowering this number. " +
                            "Each group of files is downloaded as a single combined Excel file."}
                        {...formValues.getInputProps('maxFileCount')}
                    />

                    <NumberInput
                        label={"Max File Size"}
                        min={0}
                        suffix={"MB"}
                        description={"This setting excludes files that are too large."}
                        {...formValues.getInputProps('maxFileSizeMB')}
                    />
                </Stack>
            </Fieldset>


            <Group justify={"space-between"}>
                <Tooltip label={"Reset Settings"} color={"orange"}>
                    <ActionIcon
                        size={"md"}
                        variant={"light"}
                        onClick={() => {
                            formValues.reset()
                        }}
                        aria-label={"reset settings"}
                    >
                        <IconReload/>
                    </ActionIcon>
                </Tooltip>
                <Button.Group>
                    <Tooltip label={"Load Settings"}>
                        <Button
                            size={"xs"}
                            variant={"light"}
                            onClick={() => {
                                setShowLoadDialog(true)
                            }}
                            leftSection={<IconSettingsUp/>}
                        >
                            Load
                        </Button>
                    </Tooltip>

                    <Indicator color={"none"} label={
                        <Tooltip
                            multiline
                            w={220}
                            label={
                                "Save the settings to use them later again. " +
                                "The setting will be saved to the local storage of your browser. " +
                                "This means that only you can access this saved setting in your browser."
                            }
                        >
                            <ThemeIcon
                                variant={"transparent"}
                                aria-label={"info"}
                                color={"blue"}
                                size={"xs"}
                            >
                                <IconInfoCircle/>
                            </ThemeIcon>
                        </Tooltip>
                    }>
                        <Tooltip label={"Download Settings"}>
                            <Button
                                size={"xs"}
                                variant={"light"}
                                color={"green"}
                                onClick={() => {
                                    setShowSaveDialog(true)
                                }}
                                leftSection={<IconSettingsDown/>}
                            >
                                Download
                            </Button>
                        </Tooltip>
                    </Indicator>
                </Button.Group>
                <Tooltip label={"Back to the converter"} color={"green"}>
                    <ActionIcon
                        variant={"light"}
                        onClick={() => {
                            close()
                        }}
                        aria-label={"close settings"}
                    >
                        <IconArrowRight/>
                    </ActionIcon>
                </Tooltip>
            </Group>
        </Stack>
    </>
}