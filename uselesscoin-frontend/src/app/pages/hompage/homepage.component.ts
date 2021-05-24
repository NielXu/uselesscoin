import { Component, OnInit } from '@angular/core';

import { Block } from '../../classes/block';
import { BlockChainService } from '../../services/blockchain.service';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit{

  loading: boolean = false;
  blocks: Block[];

  constructor(private blockChainService: BlockChainService) {}

  ngOnInit() {
    this.getAllBlocks();
  }

  getAllBlocks() {
    this.loading = true;
    this.blocks = [];
    this.blockChainService
      .getAllBlocks()
      .subscribe(
        (result) => {
          this.blocks = result.blockchain.reverse();
          this.loading = false;
        }
      );
  }
}
