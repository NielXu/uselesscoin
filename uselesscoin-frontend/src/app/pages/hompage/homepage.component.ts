import { Component, OnInit } from '@angular/core';

import { BlockChainService } from '../../services/blockchain.service';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit{
  constructor(private blockChainService: BlockChainService) {}

  ngOnInit() {
    this.getAllBlocks();
  }

  getAllBlocks() {
    this.blockChainService.getAllBlocks().subscribe(
      (result) => {
        console.log(result);
      }
    )
  }
}
