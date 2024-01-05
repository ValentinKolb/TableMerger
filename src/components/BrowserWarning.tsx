import {isChromeBrowser} from "../lib/hooks.ts";
import {Modal, Text, ThemeIcon, Title} from "@mantine/core";
import {IconMoodSad} from "@tabler/icons-react";

/**
 * This component is shown when the browser is not Chrome.
 * It displays a modal with a warning message that can't be closed.
 */
export default function BrowserWarning() {
    const isChrome = isChromeBrowser()

    return (
        <Modal
            opened={!isChrome}
            onClose={() => {
            }}
            centered withCloseButton={false}
        >
            <Title order={1} c={"red"}>
                Sorry,
                <ThemeIcon variant="white" size="xl" color="red">
                    <IconMoodSad/>
                </ThemeIcon>
            </Title>

            <Text c={"dimmed"} mb={"sm"}>
                This app only works with the Google Chrome browser.
            </Text>

            <Text c={"dimmed"}>
                This projects uses Web-Api's that are only available in that browser.
                This may change in the future.
            </Text>
        </Modal>
    )
}