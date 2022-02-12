package azure

import (
	"fmt"
	"net/http"

	"github.com/mlabouardy/komiser/handlers/azure/config"
)

func (handler *AzureHandler) RedisHandler(w http.ResponseWriter, r *http.Request) {
	err := config.ParseEnvironment()
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't parse environment")
	}
	subscriptionID := config.SubscriptionID()
	key := fmt.Sprintf("azure.%s.storage.redis", subscriptionID)
	response, found := handler.cache.Get(key)
	if found {
		respondWithJSON(w, 200, response)
	} else {
		response, err := handler.azure.DescribeRedisInstances(subscriptionID)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "DB:DescribeRedis is missing")
		} else {
			handler.cache.Set(key, response)
			respondWithJSON(w, 200, response)
		}
	}
}
