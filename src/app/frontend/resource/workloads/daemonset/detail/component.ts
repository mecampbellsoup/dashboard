// Copyright 2017 The Kubernetes Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Component, OnDestroy, OnInit } from '@angular/core';
import { DaemonSetDetail } from '@api/backendapi';
import { StateService } from '@uirouter/core';
import { Subscription } from 'rxjs/Subscription';

import {
  ActionbarService,
  ResourceMeta,
} from '../../../../common/services/global/actionbar';
import { NotificationsService } from '../../../../common/services/global/notifications';
import {
  EndpointManager,
  Resource,
} from '../../../../common/services/resource/endpoint';
import { NamespacedResourceService } from '../../../../common/services/resource/resource';

@Component({
  selector: 'kd-daemon-set-detail',
  templateUrl: './template.html',
})
export class DaemonSetDetailComponent implements OnInit, OnDestroy {
  private daemonSetSubscription_: Subscription;
  private name_: string;
  daemonSet: DaemonSetDetail;
  isInitialized = false;
  eventListEndpoint: string;
  podListEndpoint: string;
  serviceListEndpoint: string;

  constructor(
    private readonly daemonSet_: NamespacedResourceService<DaemonSetDetail>,
    private readonly actionbar_: ActionbarService,
    private readonly state_: StateService,
    private readonly notifications_: NotificationsService
  ) {}

  ngOnInit(): void {
    this.name_ = this.state_.params.resourceName;
    this.eventListEndpoint = EndpointManager.resource(
      Resource.daemonSet,
      true
    ).child(this.name_, Resource.event);
    this.podListEndpoint = EndpointManager.resource(
      Resource.daemonSet,
      true
    ).child(this.name_, Resource.pod);
    this.serviceListEndpoint = EndpointManager.resource(
      Resource.daemonSet,
      true
    ).child(this.name_, Resource.service);

    this.daemonSetSubscription_ = this.daemonSet_
      .get(
        EndpointManager.resource(Resource.daemonSet, true).detail(),
        this.name_
      )
      .startWith({})
      .subscribe((d: DaemonSetDetail) => {
        this.daemonSet = d;
        this.notifications_.pushErrors(d.errors);
        this.actionbar_.onInit.emit(
          new ResourceMeta('Daemon Set', d.objectMeta, d.typeMeta)
        );
        this.isInitialized = true;
      });
  }

  ngOnDestroy(): void {
    this.daemonSetSubscription_.unsubscribe();
  }
}
