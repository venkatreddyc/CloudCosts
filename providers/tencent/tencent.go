package tencent

import (
	"context"

	log "github.com/sirupsen/logrus"

	"github.com/tailwarden/komiser/providers"
	"github.com/tailwarden/komiser/providers/tencent/cvm"
	"github.com/tencentcloud/tencentcloud-sdk-go/tencentcloud/common/profile"
	tccvm "github.com/tencentcloud/tencentcloud-sdk-go/tencentcloud/cvm/v20170312"
	"github.com/uptrace/bun"
)

func listOfSupportedServices() []providers.FetchDataFunction {
	return []providers.FetchDataFunction{
		cvm.Instances,
	}
}

func FetchResources(ctx context.Context, client providers.ProviderClient, db *bun.DB) {
	for _, fetchResources := range listOfSupportedServices() {
		regions, err := client.TencentClient.DescribeRegionsWithContext(ctx, tccvm.NewDescribeRegionsRequest())
		if err != nil {
			log.Errorf("[%s][Tencent] Couldn't fetch the list of regions: %s", client.Name, err)
		}

		for _, region := range regions.Response.RegionSet {
			cpf := profile.NewClientProfile()
			cpf.Language = "en-US"
			clientWithRegion, err := tccvm.NewClient(client.TencentClient.GetCredential(), *region.Region, cpf)
			if err != nil {
				log.Errorf("[%s][Tencent] Couldn't create the Tencent client with region %s: %s", client.Name, *region.Region, err)
			}

			client.TencentClient = clientWithRegion

			resources, err := fetchResources(ctx, client)
			if err != nil {
				log.Printf("[%s][Tencent] %s", client.Name, err)
			} else {
				for _, resource := range resources {
					db.NewInsert().Model(&resource).On("CONFLICT (resource_id) DO UPDATE").Set("link = EXCLUDED.link").Exec(context.Background())
				}
			}
		}
	}
}
