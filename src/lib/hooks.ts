export const isChromeBrowser = () => {
    const ua = window.navigator.userAgent;
    return ua.indexOf('Chrome') > -1;
}