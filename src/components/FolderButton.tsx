import {ActionIcon, Button, ButtonProps, Text} from "@mantine/core";
import {IconFiles, IconX} from "@tabler/icons-react";
import {useRef} from "react";
import classes from "./FolderButton.module.css";

export default function FolderButton({value: files, onChange: setFiles,...props}: {
    value: FileList | null,
    onChange: (files: FileList | null) => void,
} & ButtonProps) {

    const ref = useRef<HTMLInputElement>(null)

    return <>
        <input
            // @ts-ignore
            webkitdirectory="true"

            type="file"
            style={{display: 'none'}}
            ref={ref}
            onChange={(e) => {
                setFiles(e.currentTarget.files)
            }}
        />

        {
            files ? <div className={classes.container}>
                    <Text c={"dimmed"}>
                        {files.length} file(s) selected
                    </Text>
                    <ActionIcon
                        variant="transparent"
                        color="red"
                        size={"xs"}
                        onClick={() => {
                            setFiles(null)
                        }}
                        aria-label={"Clear selected directory"}
                    >
                        <IconX/>
                    </ActionIcon>
                </div>
                : (
                    <Button
                        onClick={() => {
                            ref.current?.click()
                        }}
                        leftSection={<IconFiles/>}
                        variant={"light"}
                        {...props}
                    >
                        Select Folder
                    </Button>
                )
        }
    </>
}