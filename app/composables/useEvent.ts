export const useEvent = () => {
    const createEvent = async (event: any) => {
        const res = await $fetch(
            "/api/events/create",
            {
                method: "POST",
                body: event
            }
        )
        console.log("res", res)
        return res
    }
}