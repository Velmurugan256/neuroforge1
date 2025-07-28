import { ENDAVA_API_URL, getAuthHeaders } from "@/config/constants"


export const createCollection = async () => {
    try {
        const response = await fetch(`${ENDAVA_API_URL}/Collection_create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders()
            },
        })
        if (!response.ok) {
            return response.data.message
        }
        const data = await response.json()
        if (!data || typeof data !== "object") {
            throw new Error("Invalid response format from Collection API")
        }
        return data
    } catch (error) {
        if (error instanceof TypeError && error.message.includes("fetch")) {
            throw new Error("Network error. Please check your connection.")
        }
        throw error.message ? error : new Error("An unexpected error occurred. Please try again.")
    }
}

export const deleteCollection = async () => {
    try {
        const response = await fetch(`${ENDAVA_API_URL}/Collection_Delete`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders()
            },
        })
        if (!response.ok) {
            return response.data.message
        }
        const data = await response.json()
        if (!data || typeof data !== "object") {
            throw new Error("Invalid response format from Collection API")
        }
        return data
    } catch (error) {
        if (error instanceof TypeError && error.message.includes("fetch")) {
            throw new Error("Network error. Please check your connection.")
        }
        throw error.message ? error : new Error("An unexpected error occurred. Please try again.")
    }
}
export const createVector = async () => {
    try {
        const response = await fetch(`ENDAVA_API_URL/Collection_Create_Vector`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders()
            },
        })
        if (!response.ok) {
            return response.data.message
        }
        const data = await response.json()
        if (!data || typeof data !== "object") {
            throw new Error("Invalid response format from Collection API")
        }
        return data
    }
    catch (error) {
        if (error instanceof TypeError && error.message.includes("fetch")) {
            throw new Error("Network error. Please check your connection.")
        }
        throw error.message ? error : new Error("An unexpected error occurred. Please try again.")
    }
}

export const getCollectionsStatus = async () => {
    try {
        const response = await fetch(`${ENDAVA_API_URL}/Collection_Status`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders()
            },
        })
        if (!response.ok) {
            return response.data.message
        }
        const data = await response.json()
        if (!data || typeof data !== "object") {
            throw new Error("Invalid response format from Collection API")
        }
        return data
    } catch (error) {
        if (error instanceof TypeError && error.message.includes("fetch")) {
            throw new Error("Network error. Please check your connection.")
        }
        throw error.message ? error : new Error("An unexpected error occurred. Please try again.")
    }
}
